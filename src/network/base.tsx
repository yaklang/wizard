import {Palm} from "../gen/schema";

export interface PalmGeneralResponse<T> {
    pagemeta: Palm.PageMeta
    data: T[]
}

export interface PalmGeneralQueryParams {
    page?: number
    limit?: number

    order?: "desc" | "asc"
    order_by?: "created_at" | "updated_at" | string
}