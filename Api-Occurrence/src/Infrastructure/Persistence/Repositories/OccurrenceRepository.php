<?php

declare(strict_types=1);

namespace Infrastructure\Persistence\Repositories;

use Domain\Occurrence\Collections\OccurrenceStatusCollection;
use Domain\Occurrence\Collections\OccurrenceTypeCollection;
use Domain\Occurrence\Entities\Occurrence;
use Domain\Occurrence\Entities\OccurrenceStatus;
use Domain\Occurrence\Entities\OccurrenceType;
use Domain\Occurrence\Repositories\OccurrenceRepositoryInterface;
use Domain\Shared\ValueObjects\Uuid;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class OccurrenceRepository implements OccurrenceRepositoryInterface
{
    public function findById(Uuid $id): ?Occurrence
    {
        $row = DB::table('occurrences')
            ->select(
                'occurrences.*',
                'occurrence_types.name as type_name',
                'occurrence_types.category as type_category',
                'occurrence_statuses.name as status_name',
                'occurrence_statuses.is_final as status_is_final'
            )
            ->leftJoin('occurrence_types', 'occurrences.type_code', '=', 'occurrence_types.code')
            ->leftJoin('occurrence_statuses', 'occurrences.status_code', '=', 'occurrence_statuses.code')
            ->where('occurrences.id', $id->toString())
            ->first();

        return $row ? Occurrence::fromArray((array) $row) : null;
    }

    public function listOccurrences(
        ?string $statusCode = null,
        ?string $typeCode = null,
        int $perPage = 50,
        int $page = 1
    ): LengthAwarePaginator {
        $query = DB::table('occurrences')
            ->select(
                'occurrences.*',
                'occurrence_types.name as type_name',
                'occurrence_types.category as type_category',
                'occurrence_statuses.name as status_name',
                'occurrence_statuses.is_final as status_is_final'
            )
            ->leftJoin('occurrence_types', 'occurrences.type_code', '=', 'occurrence_types.code')
            ->leftJoin('occurrence_statuses', 'occurrences.status_code', '=', 'occurrence_statuses.code');

        if ($statusCode !== null) {
            $query->where('occurrences.status_code', $statusCode);
        }

        if ($typeCode !== null) {
            $query->where('occurrences.type_code', $typeCode);
        }

        $query->orderBy('occurrences.created_at', 'desc');

        $total = $query->count();
        $items = $query
            ->limit($perPage)
            ->offset(($page - 1) * $perPage)
            ->get()
            ->map(fn ($row) => Occurrence::fromArray((array) $row))
            ->all();

        $path = request()?->url() ?? '/';
        $queryParams = request()?->query() ?? [];

        return new LengthAwarePaginator(
            $items,
            $total,
            $perPage,
            $page,
            [
                'path' => $path,
                'query' => $queryParams,
            ]
        );
    }

    public function findByIdWithDispatches(Uuid $id): ?Occurrence
    {
        $occ = $this->findById($id);
        if (!$occ) {
            return null;
        }

        $dispatchRows = DB::table('dispatches')
            ->select(
                'dispatches.*',
                'dispatch_statuses.name as status_name',
                'dispatch_statuses.is_active as status_is_active'
            )
            ->leftJoin('dispatch_statuses', 'dispatches.status_code', '=', 'dispatch_statuses.code')
            ->where('dispatches.occurrence_id', $id->toString())
            ->orderBy('dispatches.created_at', 'desc')
            ->get();

        $data = $occ->toArray();
        $data['dispatches'] = array_map(fn ($r) => (array) $r, $dispatchRows->all());

        return Occurrence::fromArray($data);
    }

    public function findOccurrenceTypes(): OccurrenceTypeCollection
    {
        $rows = DB::table('occurrence_types')
            ->select('code', 'name')
            ->orderBy('name', 'asc')
            ->get();

        $types = array_map(
            static fn($row) => OccurrenceType::fromArray([...(array)$row]),
            $rows->all()
        );

        return new OccurrenceTypeCollection($types);
    }

    public function findOccurrenceStatuses(): OccurrenceStatusCollection
    {
        $rows = DB::table('occurrence_statuses')
            ->select('code', 'name')
            ->orderBy('name', 'asc')
            ->get();

        $status = array_map(
            static fn($row) => OccurrenceStatus::fromArray([...(array)$row]),
            $rows->all()
        );

        return new OccurrenceStatusCollection($status);
    }
}
