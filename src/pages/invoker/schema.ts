export const genDefaultPagination = (pageSize?: number, page?: number) => ({
    page: page || 1,
    pageSize: pageSize || 10,
});
