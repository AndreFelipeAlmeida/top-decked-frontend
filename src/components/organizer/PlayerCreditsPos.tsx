import { UserPlus, Award, ShoppingCart, CreditCard, Trash2, Search, Plus, Package, Coffee } from 'lucide-react';
import { useState } from 'react';
import { type JogadorLojaPublico } from '@/types/Player';
import { getStock, updateStock } from '@/services/stockService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Spinner from '../ui/Spinner';
import type { Estoque } from '@/types/Stock';
import { getPlayersByOrganizer } from '@/services/jogadoresService';
import { updateCredits, addCredits } from '@/services/creditoService';
import { criarJogadorLoja } from '@/services/lojasService';


export default function PlayerCreditsPos() {
  const queryClient = useQueryClient();
  const [selectedPlayer, setSelectedPlayer] = useState<JogadorLojaPublico | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cartItems, setCartItems] = useState<Array<Estoque>>([]);
  const [creditAmount, setCreditAmount] = useState(0);
  const [secondaryPayment, setSecondaryPayment] = useState<'cash' | 'card'>('cash');
  const [productFilter, setProductFilter] = useState<'all' | 'products' | 'canteen'>('all');
  const [awardCredits, setAwardCredits] = useState<string>("");
  const [awardPosition, setAwardPosition] = useState<string>("");
  const [awardPlayer, setAwardPlayer] = useState<string>("");
  const [createPlayerName, setCreatePlayerName] = useState<string>("");
  const [createPlayerTCGId, setCreatePlayerTCGId] = useState<string>("");

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: getStock,
    retry: false
  });
  const { data: players, isLoading: isPlayersLoading } = useQuery({
    queryKey: ["players"],
    queryFn: getPlayersByOrganizer,
    retry: false
  });

  const { mutate, isPending } = useMutation({
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

  const { mutate: mutateCredits, isPending: isCreditsPending } = useMutation({
      mutationFn: () => {
        if (!selectedPlayer?.id) {
          throw new Error("Player ID is required to update credits");
        }
        return updateCredits(selectedPlayer.id, {quantidade: remainingBalance});
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['players'] });
        setCartItems([]);
        setCreditAmount(0);
        setSelectedPlayer(null);
      },
      onError: () => console.error('Erro ao debitar créditos')
    });

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
  const remainingBalance = Math.max(0, cartTotal - creditAmount);

  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      productFilter === 'all' ? true :
      productFilter === 'products' ? product.categoria !== 'CANTINA' :
      product.categoria === 'CANTINA';
    return matchesSearch && matchesFilter;
  }) ?? [];

  const addToCart = (product: Estoque) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    if (existingItem) {
      setCartItems(cartItems.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantidade + 1 } : item
      ));
    } else {
      setCartItems([...cartItems, { ...product, quantidade: 1 }]);
    }
  };

  const removeFromCart = (id: number | undefined) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const handleCheckout = () => {
    cartItems.forEach((product) => {
      const stockProduct = products?.find((p) => p.id === product.id);
      
      if (stockProduct) {
        const novaQuantidade = stockProduct.quantidade - product.quantidade;
        
        mutate({
          ...product,
          quantidade: novaQuantidade
        });
      }
    });
    mutateCredits();
  };

  const { mutate: mutateAward } = useMutation({
    mutationFn: () => {
        if (awardPlayer === null) {
          throw new Error("Player ID is required to update credits");
        }
        if (awardCredits === null) {
          throw new Error("Player ID is required to update credits");
        }
        return addCredits(Number(awardPlayer), Number(awardCredits));
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['players'] });
        setAwardCredits("");
        setAwardPosition("");
        setAwardPlayer("");
      },
      onError: () => console.error('Erro ao adicionar créditos')
    })

  const { mutate: mutatecreatePlayer } = useMutation({
    mutationFn: () => {
        if (createPlayerName === null) {
          throw new Error("Name Player is required to register a player");
        }
        if (createPlayerTCGId === null) {
          throw new Error("Player ID is required to register a player");
        }
        return criarJogadorLoja({nome: createPlayerName, pokemon_id: createPlayerTCGId});
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['players'] });
        setCreatePlayerName("");
        setCreatePlayerTCGId("");
      },
      onError: () => console.error('Erro ao criar jogador')
    })

  const handleAwardPrize = () => {
    mutateAward()
  }

  const handleRegisterPlayer = () => {
    mutatecreatePlayer()
  }

  if (isLoading || isPending || isPlayersLoading || isCreditsPending) 
    return <Spinner />

  return (
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl mb-2 text-gray-900">Player Credits & POS</h1>
          <p className="text-gray-600">Manage player credits and process sales</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Player Management */}
          <div className="lg:col-span-2 space-y-6">
            {/* Register Player */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-2 mb-4">
                <UserPlus className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl text-gray-900">Register New Player</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Player Name"
                  value={createPlayerName}
                  onChange={(e) => {setCreatePlayerName(e.target.value)}}
                  className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
                <input
                  type="text"
                  placeholder="TCG ID (e.g., MTG123456)"
                  value={createPlayerTCGId}
                  onChange={(e) => {setCreatePlayerTCGId(e.target.value)}}
                  className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
              <button
                className="mt-4 w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition-colors"
                onClick={handleRegisterPlayer}>
                Register Player
              </button>
            </div>

            {/* Award Prize Credits */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Award className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl text-gray-900">Award Prize Credits</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
                  value={awardPlayer ?? ""}
                  onChange={(e) => setAwardPlayer(e.target.value)}
                >
                  <option value="">Select Player</option>
                  {players?.map(player => (
                    <option key={player.id} value={player.id}>{player.nome}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={awardCredits}
                  onChange={(e) => setAwardCredits(e.target.value)}
                  placeholder="Prize Amount ($)"
                  className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
                <input
                  type="number"
                  value={awardPosition}
                  onChange={(e) => setAwardPosition(e.target.value)}
                  placeholder="Ranking Position"
                  className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
              <button className="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors"
                onClick={handleAwardPrize}>
                Award Prize
              </button>
            </div>

            {/* Available Stock - Product Selector */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl mb-4 text-gray-900">Available Stock</h2>
              
              {/* Filter Tabs */}
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={() => setProductFilter('all')}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                    productFilter === 'all'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>All</span>
                </button>
                <button
                  onClick={() => setProductFilter('products')}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                    productFilter === 'products'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>Products</span>
                </button>
                <button
                  onClick={() => setProductFilter('canteen')}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                    productFilter === 'canteen'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Coffee className="w-4 h-4" />
                  <span>Canteen</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="mb-4 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <div 
                    key={product.id} 
                    className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="text-sm text-gray-900">{product.nome}</div>
                        <div className="text-xs text-gray-500">{product.categoria}</div>
                      </div>
                      <div className="text-sm text-gray-900">${product.preco.toFixed(2)}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">Stock: {product.quantidade}</div>
                      <button 
                        onClick={() => addToCart(product)}
                        disabled={!selectedPlayer}
                        className="flex items-center space-x-1 px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Cart & Checkout */}
          <div className="space-y-6">
            {/* Player Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl mb-4 text-gray-900">Identify Customer</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select 
                  onChange={(e) => {
                    const player = players?.find(p => p.id === Number(e.target.value));
                    setSelectedPlayer(player || null);
                    setCreditAmount(0);
                  }}
                  value={selectedPlayer?.id || ''}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="">Search by Name or ID...</option>
                  {players?.map(player => (
                    <option key={player.id} value={player.id}>{player.nome} ({player.pokemon_id})</option>
                  ))}
                </select>
              </div>
              {selectedPlayer && (
                <div className="mt-4 p-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg text-white">
                  <p className="text-sm text-purple-100 mb-1">Available Store Credit:</p>
                  <p className="text-3xl">${selectedPlayer.creditos.toFixed(2)}</p>
                </div>
              )}
            </div>

            {/* Shopping Cart */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-2 mb-4">
                <ShoppingCart className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl text-gray-900">Shopping Cart</h2>
              </div>
              
              {cartItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Cart is empty</p>
                  <p className="text-xs mt-1">Select a customer and add products</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{item.nome}</p>
                          <p className="text-xs text-gray-600">
                            ${item.preco.toFixed(2)} x {item.quantidade}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <p className="text-sm text-gray-900">${(item.preco * item.quantidade).toFixed(2)}</p>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Payment Section */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between text-lg mb-4">
                      <span className="text-gray-900">Total Due:</span>
                      <span className="text-2xl text-gray-900">${cartTotal.toFixed(2)}</span>
                    </div>

                    {/* Hybrid Payment System */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                      <label className="block text-sm mb-2 text-gray-700">Use Store Credit:</label>
                      <input
                        type="number"
                        value={creditAmount}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          const maxCredit = Math.min(selectedPlayer?.creditos || 0, cartTotal);
                          setCreditAmount(Math.min(value, maxCredit));
                        }}
                        max={Math.min(selectedPlayer?.creditos || 0, cartTotal)}
                        min={0}
                        step={0.01}
                        placeholder="0.00"
                        disabled={!selectedPlayer}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:bg-gray-100"
                      />
                      {selectedPlayer && (
                        <p className="text-xs text-gray-600 mt-1">
                          Max: ${Math.min(selectedPlayer.creditos, cartTotal).toFixed(2)}
                        </p>
                      )}
                    </div>

                    {/* Remaining Balance */}
                    {creditAmount > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Paid with Credit:</span>
                          <span className="text-green-600">-${creditAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm border-t border-gray-200 pt-2">
                          <span className="text-gray-900">Remaining Balance:</span>
                          <span className="text-gray-900">${remainingBalance.toFixed(2)}</span>
                        </div>
                      </div>
                    )}

                    {/* Secondary Payment Method */}
                    {remainingBalance > 0 && (
                      <div className="mb-4">
                        <label className="block text-sm mb-2 text-gray-700">
                          Pay Remaining with:
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setSecondaryPayment('cash')}
                            className={`py-2 px-4 rounded-lg border-2 transition-colors ${
                              secondaryPayment === 'cash'
                                ? 'border-purple-600 bg-purple-50 text-purple-600'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            Cash
                          </button>
                          <button
                            onClick={() => setSecondaryPayment('card')}
                            className={`py-2 px-4 rounded-lg border-2 transition-colors ${
                              secondaryPayment === 'card'
                                ? 'border-purple-600 bg-purple-50 text-purple-600'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            Card
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Checkout Button */}
                    <button 
                      onClick={handleCheckout}
                      disabled={!selectedPlayer || cartItems.length === 0}
                      className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      <CreditCard className="w-5 h-5" />
                      <span>Complete Purchase</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}