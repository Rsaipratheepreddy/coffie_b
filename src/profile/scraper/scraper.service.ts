// src/auth/scraper.service.ts
import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as puppeteer from 'puppeteer';

interface Experience {
    company: string;
    title: string;
    dateRange: string;
    description: string;
}

interface Education {
    institution: string;
    degree: string;
    dateRange: string;
}

@Injectable()
export class ScraperService {
    constructor(private configService: ConfigService) {}
    private readonly logger = new Logger(ScraperService.name);

    async fetchProfile(url: string): Promise<{
        name: string;
        headline: string;
        experience: Experience[];
        education: Education[];
    }> {
        this.logger.log(`Scraping LinkedIn profile: ${url}`);

        const browser = await puppeteer.launch({
            executablePath: this.configService.get('PUPPETEER_EXECUTABLE_PATH'),
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
            'AppleWebKit/537.36 (KHTML, like Gecko) ' +
            'Chrome/114.0.0.0 Safari/537.36'
        );

        await page.goto(url, { waitUntil: 'networkidle2' });

        // wait up to 5s for the name element to appear
        try {
            await page.waitForSelector('h1.text-heading-xlarge', { timeout: 5000 });
        } catch {
            await browser.close();
            throw new InternalServerErrorException(
                'Unable to find profile heading on the page'
            );
        }

        // 1) Name & headline
        const name = await page.$eval(
            'h1.text-heading-xlarge',
            el => el.textContent?.trim() || ''
        );
        const headline = await page
            .$$eval('div.text-body-medium.break-words', els =>
                els.length ? els[0].textContent?.trim() || '' : ''
            );

        // 2) Experience
        const experience: Experience[] = await page.$$eval(
            'section#experience-section li',
            items =>
                items.map(item => {
                    const company =
                        item
                            .querySelector('p.pv-entity__secondary-title')
                            ?.textContent?.trim() || '';
                    const title =
                        item
                            .querySelector('h3')
                            ?.textContent?.trim() || '';
                    const dateRange =
                        item
                            .querySelector('h4.pv-entity__date-range span:nth-child(2)')
                            ?.textContent?.trim() || '';
                    const description =
                        item
                            .querySelector('.pv-entity__description')
                            ?.textContent?.trim() || '';
                    return { company, title, dateRange, description };
                })
        ).catch(() => []);

        // 3) Education
        const education: Education[] = await page.$$eval(
            'section#education-section li',
            items =>
                items.map(item => {
                    const institution =
                        item
                            .querySelector('h3.pv-entity__school-name')
                            ?.textContent?.trim() || '';
                    const degree =
                        item
                            .querySelector('p.pv-entity__degree-name span:nth-child(2)')
                            ?.textContent?.trim() || '';
                    const dateRange =
                        item
                            .querySelector('p.pv-entity__dates span:nth-child(2)')
                            ?.textContent?.trim() || '';
                    return { institution, degree, dateRange };
                })
        ).catch(() => []);

        await browser.close();
        return {
            name,
            headline: Array.isArray(headline) ? headline[0] : headline,
            experience,
            education,
        };
    }
}
