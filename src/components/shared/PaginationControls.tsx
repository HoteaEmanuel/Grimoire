import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

function pageHref(basePath: string, page: number): string {
  return page <= 1 ? basePath : `${basePath}?page=${page}`;
}

function getPageNumbers(currentPage: number, totalPages: number): (number | "ellipsis")[] {
  const pages = new Set<number>([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  const sorted = Array.from(pages)
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);

  const result: (number | "ellipsis")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push("ellipsis");
    result.push(sorted[i]);
  }
  return result;
}

export function PaginationControls({ currentPage, totalPages, basePath }: PaginationControlsProps) {
  if (totalPages < 1) return null;

  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <Pagination className="mt-8">
      <PaginationContent>
        <PaginationItem>
          {hasPrevious ? (
            <PaginationPrevious href={pageHref(basePath, currentPage - 1)} />
          ) : (
            <PaginationPrevious
              href="#"
              aria-disabled="true"
              tabIndex={-1}
              className="pointer-events-none opacity-40"
            />
          )}
        </PaginationItem>

        {getPageNumbers(currentPage, totalPages).map((page, i) =>
          page === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <PaginationLink href={pageHref(basePath, page)} isActive={page === currentPage}>
                {page}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          {hasNext ? (
            <PaginationNext href={pageHref(basePath, currentPage + 1)} />
          ) : (
            <PaginationNext
              href="#"
              aria-disabled="true"
              tabIndex={-1}
              className="pointer-events-none opacity-40"
            />
          )}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
