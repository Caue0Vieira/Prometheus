<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\CreateDispatchRequest;
use App\Http\Requests\UpdateDispatchStatusRequest;
use Domain\Dispatch\Service\DispatchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class DispatchController extends Controller
{
    public function __construct(
        private readonly DispatchService $dispatchService
    ) {}

    public function create(CreateDispatchRequest $request, string $occurrenceId): JsonResponse
    {
        $result = $this->dispatchService->createDispatch(
            occurrenceId: $occurrenceId,
            resourceCode: $request->input('resourceCode'),
            idempotencyKey: '',
            source: 'internal_system'
        );

        return response()->json($result->toArray(), 202);
    }

    public function close(Request $request, string $dispatchId): JsonResponse
    {
        $result = $this->dispatchService->closeDispatch(
            dispatchId: $dispatchId,
            idempotencyKey: '',
            source: 'internal_system'
        );

        return response()->json($result->toArray(), 202);
    }

    public function updateStatus(UpdateDispatchStatusRequest $request, string $dispatchId): JsonResponse
    {
        $result = $this->dispatchService->updateDispatchStatus(
            dispatchId: $dispatchId,
            statusCode: $request->input('statusCode'),
            idempotencyKey: (string) $request->attributes->get('idempotency_key', ''),
            source: 'internal_system'
        );

        return response()->json($result->toArray(), 202);
    }
}
