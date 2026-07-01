class APIHelper {
  constructor(query, querystr) {
    this.query = query; //mngodb query
    this.querystr = querystr; // query string from url
  }
  search() {
    const keyword = this.querystr.keyword
      ? {
          name: {
            $regex: this.querystr.keyword,
            $options: "i",
          },
        }
      : {};
    this.query = this.query.find({ ...keyword });
    return this;
  }
  //Http://localhost:8000/api/v1/products?category=electronics&keyword=Headphones&page=1&limite=3
  filter() {
    const querycopy = { ...this.querystr };
    const removeFields = ["keyword", "page", "limit"];
    removeFields.forEach((key) => delete querycopy[key]);
    this.query = this.query.find(querycopy);
    return this;
  }
  pagination(resultperpage) {
    const currentPage = Number(this.querystr.page) || 1;
    const skip = resultperpage * (currentPage - 1);
    this.query = this.query.limit(resultperpage).skip(skip);
    return this;
  }
}
export default APIHelper;
