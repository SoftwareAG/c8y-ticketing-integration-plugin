export interface MicroserviceHealth {
    status: string;
    components?: {
        diskSpace: {
            status: string;
            details: {
                total: number;
                free: number;
                threshold: number;
            };
        };
        heapMemory: {
            status: string;
            details: {
                init: number;
                used: number;
                committed: number;
                max: number;
                threshold: number;
            };
        };
        nonHeapMemory: {
            status: string;
            details: {
                init: number;
                used: number;
                committed: number;
                max: number;
            };
        };
        ping: {
            status: string;
        };
    };
}