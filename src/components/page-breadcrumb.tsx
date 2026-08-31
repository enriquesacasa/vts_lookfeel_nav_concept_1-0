import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface Crumb {
  label: string
  onClick?: () => void
}

interface PageBreadcrumbProps {
  crumbs: Crumb[]
}

export function PageBreadcrumb({ crumbs }: PageBreadcrumbProps) {
  if (crumbs.length < 2) return null
  const parents = crumbs.slice(0, -1)
  const current = crumbs[crumbs.length - 1]

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {parents.map((c, i) => (
          <>
            <BreadcrumbItem key={i}>
              <BreadcrumbLink
                className="cursor-pointer text-xs"
                onClick={c.onClick}
              >
                {c.label}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator key={`sep-${i}`} />
          </>
        ))}
        <BreadcrumbItem>
          <BreadcrumbPage className="text-xs">{current.label}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
