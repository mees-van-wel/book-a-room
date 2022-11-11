import { Route } from "../enums/route.enum";

export const generateRoute = (
  route: Route,
  query: Record<string, any>,
  params?: Record<string, any>
) =>
  `${Object.keys(query).reduce(
    (string, queryKey) => string.replace(`[${queryKey}]`, query[queryKey]),
    route
  )}${params ? `?${new URLSearchParams(params).toString()}` : ""}`;
