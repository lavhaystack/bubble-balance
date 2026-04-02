import ProductRow from "./ProductRow";

export default function InventoryTable({ products, updateProduct, deleteProduct }: any) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="px-3 py-2 text-left">Product</th>
            <th className="px-3 py-2 text-left">SKU</th>
            <th className="px-3 py-2 text-left">Category</th>
            <th className="px-3 py-2 text-left">Quantity</th>
            <th className="px-3 py-2 text-left">Price</th>
            <th className="px-3 py-2 text-left">Status</th>
            <th className="px-3 py-2 text-left">Expiration</th>
            <th className="px-3 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p: any, index: number) => (
            <ProductRow
              key={`${p.sku}-${index}`}  
              product={p}
              updateProduct={updateProduct}
              deleteProduct={deleteProduct}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}