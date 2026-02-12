<?php

declare(strict_types=1);

namespace App\Http\Controllers\Integration;

use App\Http\Requests\CreateOccurrenceRequest;
use Domain\Occurrence\Services\OccurrenceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Log;

class IntegrationOccurrenceController extends Controller
{
    public function __construct(
        private readonly OccurrenceService $occurrenceService
    ) {}

    public function create(CreateOccurrenceRequest $request): JsonResponse
    {
        Log::info('📥 [API] POST /api/integrations/occurrences received', [
            'externalId' => $request->input('externalId'),
            'type' => $request->input('type'),
            'idempotencyKey' => $request->attributes->get('idempotency_key'),
        ]);

        try {
            Log::info('📦 [API] Calling occurrence service', [
                'externalId' => $request->input('externalId'),
            ]);

            $result = $this->occurrenceService->createOccurrence(
                externalId: $request->input('externalId'),
                type: $request->input('type'),
                description: $request->input('description'),
                reportedAt: $request->input('reportedAt'),
                idempotencyKey: (string) $request->attributes->get('idempotency_key'),
                source: 'external_system'
            );

            Log::info('✅ [API] Service completed, returning response', [
                'commandId' => $result->commandId,
            ]);

            return response()->json($result->toArray(), 202);
        } catch (\Throwable $e) {
            Log::error('❌ [API] Error in create occurrence', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }
}

