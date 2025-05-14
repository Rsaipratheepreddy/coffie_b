// src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import {
    HealthCheck,
    HealthCheckService,
    TypeOrmHealthIndicator,
    MemoryHealthIndicator,
    DiskHealthIndicator
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
    constructor(
        private healthCheckService: HealthCheckService,
        private typeOrmHealthIndicator: TypeOrmHealthIndicator,
        private memoryHealthIndicator: MemoryHealthIndicator,
        private diskHealthIndicator: DiskHealthIndicator,
    ) { }

    @Get()
    @HealthCheck()
    check() {
        return this.healthCheckService.check([
            // Check database connection
            () => this.typeOrmHealthIndicator.pingCheck('database'),

            // Check memory usage
            () => this.memoryHealthIndicator.checkHeap('memory_heap', 150 * 1024 * 1024), // 150MB

            // Check disk storage
            () => this.diskHealthIndicator.checkStorage('disk', {
                path: '/',
                thresholdPercent: 0.9  // 90%
            }),
        ]);
    }
}