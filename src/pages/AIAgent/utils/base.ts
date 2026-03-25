export const formatJson = (filterVal: string[], jsonData: any[]) => {
    return jsonData.map((v) => filterVal.map((j) => v[j]));
};
