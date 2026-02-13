<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Resources\OccurrenceResource;
use Application\UseCases\GetOccurrence\GetOccurrenceHandler;
use Application\UseCases\GetOccurrence\GetOccurrenceQuery;
use Application\UseCases\ListOccurrences\ListOccurrencesHandler;
use Application\UseCases\ListOccurrences\ListOccurrencesQuery;
use Domain\Occurrence\Services\OccurrenceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class OccurrenceController extends Controller
{
    public function __construct(
        private readonly ListOccurrencesHandler $listOccurrencesHandler,
        private readonly GetOccurrenceHandler $getOccurrenceHandler,
        private readonly OccurrenceService $occurrenceService,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $query = new ListOccurrencesQuery(
            status: $request->query('status'),
            type: $request->query('type'),
            limit: (int)$request->query('limit', 50),
            page: (int)$request->query('page', 1),
        );

        $result = $this->listOccurrencesHandler->handle($query);

        return response()->json($result->toArray());
    }

    public function show(string $id): JsonResponse
    {
        $query = new GetOccurrenceQuery(occurrenceId: $id);
        $occurrence = $this->getOccurrenceHandler->handle($query);

        return (new OccurrenceResource($occurrence))->response();
    }

    public function start(Request $request, string $id): JsonResponse
    {
        $result = $this->occurrenceService->startOccurrence(
            occurrenceId: $id,
            idempotencyKey: (string) $request->attributes->get('idempotency_key'),
            source: 'internal_system'
        );

        return response()->json($result->toArray(), 202);
    }

    public function resolve(Request $request, string $id): JsonResponse
    {
        $result = $this->occurrenceService->resolveOccurrence(
            occurrenceId: $id,
            idempotencyKey: '',
            source: 'internal_system'
        );

        return response()->json($result->toArray(), 202);
    }

    public function findOccurrenceTypes(): JsonResponse
    {
        $types = $this->occurrenceService->findOccurrenceTypes();

        return response()->json(['data' => $types]);
    }
}
