import { Package, Coffee, AlertTriangle, Plus, Minus, Edit, X, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { type Estoque } from '@/types/Stock';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createStock, deleteStock, getStock, updateStock } from '@/services/stockService';
import Spinner from '../ui/Spinner';


export default function StockInventory() {
  const [activeTab, setActiveTab] = useState<'products' | 'canteen'>('products');
  const [editingProduct, setEditingProduct] = useState<Estoque | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Estoque | null>(null);
  const [addStockQuantity, setAddStockQuantity] = useState<string>('');
  const queryClient = useQueryClient();

  const [newProduct, setNewProduct] = useState<Partial<Estoque>>({
    nome: '',
    categoria: "GERAIS",
    quantidade: 0,
    min_quantidade: 0,
    preco: 0,
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: getStock,
    retry: false
  });
  
  const { mutate: mutateUpdateProduct, isPending: isUpdatePending } = useMutation({
      mutationFn: (product: Estoque | null) => {
        if (!product?.id) {
          throw new Error("Product ID is required to update stock");
        }
        return updateStock(product.id, product);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['products'] });
      },
      onError: () => console.error('Erro ao atualizar o item')
    });

  const { mutate: mutateCreateProduct, isPending: isCreatePending } = useMutation({
      mutationFn: (productToAdd: Estoque) => {
        return createStock(productToAdd);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['products'] });
      },
      onError: () => console.error('Erro ao atualizar o item')
    });

  const { mutate: mutateDeleteProduct, isPending: isDeletePending } = useMutation({
      mutationFn: (productToDelete: Estoque) => {
        if (!productToDelete?.id) {
          throw new Error("Product ID is required to update stock");
        }
        return deleteStock(productToDelete.id);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['products'] });
      },
      onError: () => console.error('Erro ao atualizar o item')
    });

  const groupedProducts = products?.reduce(
    (acc, product) => {
      if (product.categoria === "CANTINA") {
        acc.canteen.push(product);
      } else if (product.categoria === "GERAIS") {
        acc.general.push(product);
      }
      return acc;
    },
    { canteen: [] as Estoque[], general: [] as Estoque[] }
  ) ?? { canteen: [], general: [] };

  const currentItems = activeTab === 'products' ? groupedProducts.general : groupedProducts.canteen;

  const isLowStock = (quantity: number, minQuantity: number) => quantity < minQuantity;

  const handleQuickIncrement = (item: Estoque) => {
    item.quantidade += 1
    mutateUpdateProduct(item);
  };
  
  const handleQuickDecrement = (item: Estoque) => {
    if (item.quantidade <= 0)
      return

    item.quantidade -= 1
    mutateUpdateProduct(item);
  };

  const handleSaveEdit = () => {
    mutateUpdateProduct(editingProduct);
    setEditingProduct(null);
  };
  
  const handleOpenAddStock = (item: Estoque) => {
    setSelectedProduct(item);
    setAddStockQuantity('');
    setShowAddStockModal(true);
  };
  
  const handleOpenDeleteConfirm = (item: Estoque) => {
    setSelectedProduct(item);
    setShowDeleteConfirm(true);
  };

  const handleRegisterProduct = () => {
    if (!newProduct.nome || !newProduct.categoria || !newProduct.preco) {
      alert('Please fill in all required fields');
      return;
    }
        
    const productToAdd: Estoque = {
      nome: newProduct.nome,
      categoria: newProduct.categoria,
      quantidade: newProduct.quantidade || 0,
      min_quantidade: newProduct.min_quantidade || 0,
      preco: newProduct.preco || 0,
    };
    
    mutateCreateProduct(productToAdd);    
    setShowRegisterModal(false);
    setNewProduct({
      nome: '',
      categoria: 'GERAIS',
      quantidade: 0,
      min_quantidade: 0,
      preco: 0,
    });
  };

  const handleConfirmAddStock = () => {
    if (selectedProduct && addStockQuantity) {
      const quantityToAdd = parseInt(addStockQuantity);
      if (isNaN(quantityToAdd) || quantityToAdd <= 0) {
        alert('Please enter a valid quantity');
        return;
      }
      
      const updatedProduct = {
      ...selectedProduct,
      quantidade: (selectedProduct.quantidade || 0) + quantityToAdd
      };
      mutateUpdateProduct(updatedProduct)
      setShowAddStockModal(false);
      setSelectedProduct(null);
      setAddStockQuantity('');
    }
  };

  const handleConfirmDelete = () => {
    if (selectedProduct) {
      mutateDeleteProduct(selectedProduct);
      setShowDeleteConfirm(false);
      setSelectedProduct(null);
    }
  };

  if (isLoading || isUpdatePending || isCreatePending || isDeletePending) return <Spinner />

  return (
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl mb-2 text-gray-900">Stock & Inventory</h1>
              <p className="text-gray-600">Manage your store inventory and supplies</p>
            </div>
            <button
              onClick={() => setShowRegisterModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Register New Product
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 ${
              activeTab === 'products'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Package className="w-5 h-5" />
            <span>Products</span>
          </button>
          <button
            onClick={() => setActiveTab('canteen')}
            className={`px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 ${
              activeTab === 'canteen'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Coffee className="w-5 h-5" />
            <span>Canteen</span>
          </button>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">
                    Item Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map((item) => {
                  const lowStock = isLowStock(item.quantidade, item.min_quantidade);
                  return (
                    <tr key={item.id} className={lowStock ? 'bg-red-50' : 'hover:bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {lowStock && (
                            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                          )}
                          <span className="text-gray-900">{item.nome}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.categoria}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          {/* Quick decrement button */}
                          <button
                            onClick={() => handleQuickDecrement(item)}
                            disabled={item.quantidade === 0}
                            className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
                              item.quantidade === 0
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            title="Decrease by 1"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          
                          {/* Quantity display */}
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm font-medium min-w-[3ch] text-center ${lowStock ? 'text-red-600' : 'text-gray-900'}`}>
                              {item.quantidade}
                            </span>
                            {lowStock && (
                              <span className="text-xs text-red-600">(Min: {item.min_quantidade})</span>
                            )}
                          </div>
                          
                          <button
                            onClick={() => handleQuickIncrement(item)}
                            className="w-7 h-7 rounded-md bg-purple-600 text-white hover:bg-purple-700 flex items-center justify-center transition-colors"
                            title="Increase by 1"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${item.preco.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {lowStock ? (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                            Low Stock
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => setEditingProduct(item)}
                            className="text-purple-600 hover:text-purple-700"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleOpenAddStock(item)}
                            className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
                          >
                            Add Stock
                          </button>
                          <button 
                            onClick={() => handleOpenDeleteConfirm(item)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600 mb-1">Total Items</div>
            <div className="text-3xl text-gray-900">{currentItems.length}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600 mb-1">Low Stock Alerts</div>
            <div className="text-3xl text-red-600">
              {currentItems.filter(item => isLowStock(item.quantidade, item.min_quantidade)).length}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600 mb-1">Total Value</div>
            <div className="text-3xl text-gray-900">
              ${currentItems.reduce((sum, item) => sum + (item.quantidade * item.preco), 0).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Register New Product Modal */}
        {showRegisterModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl text-gray-900">Register New Product</h3>
                <button
                  onClick={() => setShowRegisterModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Product Name *</label>
                  <input
                    type="text"
                    value={newProduct.nome}
                    onChange={(e) => setNewProduct({ ...newProduct, nome: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    placeholder="e.g., Booster Pack"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Category *</label>
                  <select
                    value={newProduct.categoria}
                    onChange={(e) => setNewProduct({ ...newProduct, categoria: e.target.value as 'GERAIS' | 'CANTINA' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  >
                    <option value="GERAIS">General Product</option>
                    <option value="CANTINA">Canteen</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Price ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newProduct.preco || ''}
                      onChange={(e) => setNewProduct({ ...newProduct, preco: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Initial Quantity</label>
                    <input
                      type="number"
                      value={newProduct.quantidade || ''}
                      onChange={(e) => setNewProduct({ ...newProduct, quantidade: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Minimum Quantity Alert</label>
                  <input
                    type="number"
                    value={newProduct.min_quantidade || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, min_quantidade: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRegisterProduct}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Register Product
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {editingProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl text-gray-900">Edit Product</h3>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Product Name</label>
                  <input
                    type="text"
                    value={editingProduct.nome}
                    onChange={(e) => setEditingProduct({ ...editingProduct, nome: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Category</label>
                  <select
                    value={newProduct.categoria}
                    onChange={(e) => setNewProduct({ ...newProduct, categoria: e.target.value as 'GERAIS' | 'CANTINA' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  >
                    <option value="GERAIS">General Product</option>
                    <option value="CANTINA">Canteen</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Stock Quantity</label>
                  <input
                    type="number"
                    value={editingProduct.quantidade}
                    onChange={(e) => setEditingProduct({ ...editingProduct, quantidade: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    placeholder="Enter stock quantity"
                  />
                  <p className="text-xs text-gray-500 mt-1">Manually override the current stock count</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingProduct.preco}
                      onChange={(e) => setEditingProduct({ ...editingProduct, preco: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Min. Quantity</label>
                    <input
                      type="number"
                      value={editingProduct.min_quantidade}
                      onChange={(e) => setEditingProduct({ ...editingProduct, min_quantidade: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Stock Modal */}
        {showAddStockModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl text-gray-900">Add Stock</h3>
                <button
                  onClick={() => setShowAddStockModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Product</div>
                  <div className="text-lg text-gray-900">{selectedProduct.nome}</div>
                  <div className="text-sm text-gray-600 mt-2">Current Stock: <span className="font-semibold">{selectedProduct.quantidade}</span></div>
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Quantity to Add *</label>
                  <input
                    type="number"
                    min="1"
                    value={addStockQuantity}
                    onChange={(e) => setAddStockQuantity(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    placeholder="Enter quantity"
                    autoFocus
                  />
                </div>
                {addStockQuantity && !isNaN(parseInt(addStockQuantity)) && parseInt(addStockQuantity) > 0 && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">New Total Stock</div>
                    <div className="text-2xl text-purple-600 font-semibold">
                      {selectedProduct.quantidade + parseInt(addStockQuantity)}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowAddStockModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAddStock}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl text-gray-900">Confirm Delete</h3>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-gray-900">Are you sure you want to delete this item?</p>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-semibold">{selectedProduct.nome}</span>
                    </p>
                  </div>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-sm text-red-800">
                    This action cannot be undone. All data related to this product will be permanently removed.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Product
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}