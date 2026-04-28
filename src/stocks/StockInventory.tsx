import {
  Plus,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { type Estoque } from '@/types/Stock';
import { RegisterProductModal } from './components/AddProductModal';
import { useStockData } from './hooks/useStockData';
import Spinner from '@/components/ui/Spinner';
import { ProductTable } from './components/ProductsTable';
import { CategoryTabs } from './components/CategoryTabs';
import { RegisterCategoryModal } from './components/AddCategoryModal';


export default function StockInventory() {
  const [editingProduct, setEditingProduct] = useState<Estoque | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<number>(-1);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);

  const { categories, products, isLoading } = useStockData();

  const isLowStock = (quantity: number, minQuantity: number) =>
    quantity < minQuantity;

  const filteredItems = useMemo(() => {
    if (!products) return [];
    if (activeCategoryId === -1) return products;
    return products.filter((item) => item.categoria === activeCategoryId);
  }, [products, activeCategoryId]);

  if (isLoading)
    return <Spinner />

  const handleProductEdit = (item: Estoque) => {
    setEditingProduct(item);
    setShowProductModal(true);
  }

  const handleProductModalClose = () => {
    setEditingProduct(null);
    setShowProductModal(false);
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl mb-2 text-gray-900">Estoque</h1>
            <p className="text-gray-600">Organize seu estoque</p>
          </div>
          <button
            onClick={() => setShowProductModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Cadastrar novo produto
          </button>
        </div>
      </div>

      <div className="flex space-x-2 overflow-x-auto">
        <CategoryTabs
          categories={categories || []}
          activeId={activeCategoryId}
          onSelect={setActiveCategoryId}
          onAddCategory={() => setShowAddCategoryModal(true)}
        />
      </div>

      <ProductTable
        items={filteredItems}
        onEdit={handleProductEdit}
        categories={categories}
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">Quantidade de Items</div>
          <div className="text-3xl text-gray-900">{filteredItems.length}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">
            Alerta de Estoque baixo
          </div>
          <div className="text-3xl text-red-600">
            {
              filteredItems.filter((item) =>
                isLowStock(item.quantidade, item.min_quantidade),
              ).length
            }
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">Valor Total</div>
          <div className="text-3xl text-gray-900">
            R$
            {filteredItems
              .reduce((sum, item) => sum + item.quantidade * item.preco, 0)
              .toFixed(2)}
          </div>
        </div>
      </div>

      <RegisterCategoryModal
        isOpen={showAddCategoryModal}
        onClose={() => setShowAddCategoryModal(false)}
      />

      {/* Register New Product Modal */}
      <RegisterProductModal
        key={editingProduct?.id ?? 'new-product'}
        isOpen={showProductModal}
        onClose={handleProductModalClose}
        categories={categories}
        initialData={editingProduct}
      />
    </div>
  );
}
