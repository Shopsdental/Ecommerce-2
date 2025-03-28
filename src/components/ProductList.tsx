import Link from "next/link";
import Image from "next/image";
import img1 from "@/assets/Airoter_Product_1.jpg";
import { wixClientServer } from "@/lib/wixClientServer";
import { products } from "@wix/stores";
import Pagination from "./Pagination";

const PRODUCT_PER_PAGE = 12;

const ProductList = async ({
  categoryId,
  limit,
  searchParams,
}: {
  categoryId: string;
  limit?: number;
    searchParams?: any;
}) => {
  const WixClient = await wixClientServer();

  const productQuery = WixClient.products
  .queryProducts()
  .startsWith("name", searchParams?.name || "")
  .eq("collectionIds", categoryId)
  .hasSome(
    "productType",
    searchParams?.type ? [searchParams.type] : ["physical", "digital"]
  )
  .gt("priceData.price", searchParams?.min || 0)
  .lt("priceData.price", searchParams?.max || 999999)
  .limit(limit || PRODUCT_PER_PAGE)
  .skip(searchParams?.page ? parseInt(searchParams.page) *(limit || PRODUCT_PER_PAGE) : 0);

if (searchParams?.sort) {
  const [sortType, sortBy] = searchParams.sort.split(" ");
  if (sortType === "asc") {
    productQuery.ascending(sortBy);
  }
  if (sortType === "desc") {
    productQuery.descending(sortBy);
  }
}

const res = await productQuery.find();
    
  return (
    <div className="mt-12 flex gap-x-8 gap-y-16 justify-between flex-wrap">
      {res.items.map((product: products.Product) => (
        <Link
          href={"/"+product.slug}
          className="w-full flex flex-col gap-4 sm:w-[45%] lg:w-[22%]"
          key={product._id}
        >
          <div className="relative w-full h-64">
            <Image
              src={product.media?.mainMedia?.image?.url || "/product.png"}
              alt=""
              fill
              sizes="25vw"
              className="absolute object-contain rounded-md z-10 hover:opacity-0 transition-opacity easy duration-500"
            />
           {product.media?.items && (<Image
              src={product.media?.items[1]?.image?.url || "/product.png"}
              alt=""
              fill
              sizes="25vw"
              className="absolute object-contain rounded-md"
            />)}
          </div>

          <div className="flex justify-between">
            <span className="font-medium">{product.name}</span>
            <span className="font-semibold">₹{product.price?.price}</span>
          </div>
          <div>
            
        <h4 className="text-sm"><b>Company</b> : {product.brand}</h4>
          </div>
          {/* <div className="text-sm text-gray-500">
            Best Seller of this month
          </div> */}
          <button className="rounded-2xl ring-1 ring-lama text-lama w-max py-2 px-4 text-xs hover:bg-lama hover:text-white">
            {" "}
            Add To Cart
          </button>
        </Link>
      ))}
      {searchParams?.cat || searchParams?.name ? (
        <Pagination
          currentPage={res.currentPage || 0}
          hasPrev={res.hasPrev()}
          hasNext={res.hasNext()}
        />
      ) : null}
    </div>
  );
};

export default ProductList;
