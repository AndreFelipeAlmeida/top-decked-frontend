// import { useAuthContext } from '@/hooks/useAuthContext';
import { getPlayerCredits } from '@/services/creditoService';
import { editarPerfilJogador } from '@/services/jogadoresService';
import type { JogadorPublico } from '@/types/Player';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit, Save, Store } from 'lucide-react';
import { useState } from 'react';
// import { useState } from 'react';


export default function PlayerProfileWallet() {
  // const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const [isEditingGameIds, setIsEditingGameIds] = useState(false);
  const [pokemonId, setPokemonId] = useState("");

  const { data: stores = [] } = useQuery({
    queryKey: ["creditos"],
    queryFn: getPlayerCredits
  })

  const { mutate } = useMutation({
    mutationFn: () => editarPerfilJogador(pokemonId),
    onSuccess: (data: JogadorPublico) => {
      queryClient.invalidateQueries({ queryKey: ['creditos'] });
      setPokemonId(data.pokemon_id ?? "")
      setIsEditingGameIds(false)
    }
  });
  const handleSaveGameIds = () => {
    mutate()
  }

  // const storeTransactions = getTransactionsForStore(selectedStore.id);
  const totalCredits = stores.reduce((sum, store) => sum + store.quantidade, 0);


  return (
      <div className="p-8">
        Header
        <div className="mb-8">
          <h1 className="text-3xl mb-2 text-gray-900">Perfil & Carteira</h1>
          <p className="text-gray-600">Organize suas informações pessoais e os seus créditos em múltiplas lojas</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile & Wallet */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information */}
            {/* <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl text-gray-900">Personal Information</h2>
                {!isEditingProfile ? (
                  <button 
                    onClick={() => setIsEditingProfile(true)}
                    className="text-purple-600 hover:text-purple-700 flex items-center space-x-1"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="text-sm">Edit</span>
                  </button>
                ) : (
                  <button 
                    onClick={handleSaveProfile}
                    className="text-green-600 hover:text-green-700 flex items-center space-x-1"
                  >
                    <Save className="w-4 h-4" />
                    <span className="text-sm">Save</span>
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={user?.nome}
                    disabled={true}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${
                      isEditingProfile 
                        ? 'focus:outline-none focus:ring-2 focus:ring-purple-600' 
                        : 'bg-gray-50 text-gray-900'
                    }`}
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Email</label>
                  <input
                    type="email"
                    value={user?.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Member Since</label>
                  <input
                    type="text"
                    value="January 2024"
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                  />
                </div>
              </div>
            </div> */}

            {/* Game IDs */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl text-gray-900">IDs dos Jogos</h2>
                {!isEditingGameIds ? (
                  <button 
                    onClick={() => setIsEditingGameIds(true)}
                    className="text-purple-600 hover:text-purple-700 flex items-center space-x-1"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="text-sm">Edit</span>
                  </button>
                ) : (
                  <button 
                    onClick={handleSaveGameIds}
                    className="text-green-600 hover:text-green-700 flex items-center space-x-1"
                  >
                    <Save className="w-4 h-4" />
                    <span className="text-sm">Save</span>
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* <div>
                  <label className="block text-sm text-gray-600 mb-1">Magic ID</label>
                  <input
                    type="text"
                    value={gameIds.magic}
                    onChange={(e) => setGameIds({ ...gameIds, magic: e.target.value })}
                    disabled={!isEditingGameIds}
                    className={`w-full px-3 py-2 border border-gray-300 rounded ${
                      isEditingGameIds 
                        ? 'focus:outline-none focus:ring-2 focus:ring-purple-600' 
                        : 'bg-gray-50 text-gray-900'
                    }`}
                  />
                </div> */}
                {/* <div>
                  <label className="block text-sm text-gray-600 mb-1">Konami ID (Yu-Gi-Oh!)</label>
                  <input
                    type="text"
                    value={gameIds.yugioh}
                    onChange={(e) => setGameIds({ ...gameIds, yugioh: e.target.value })}
                    disabled={!isEditingGameIds}
                    className={`w-full px-3 py-2 border border-gray-300 rounded ${
                      isEditingGameIds 
                        ? 'focus:outline-none focus:ring-2 focus:ring-purple-600' 
                        : 'bg-gray-50 text-gray-900'
                    }`}
                  />
                </div> */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">ID do Jogador</label>
                  <input
                    type="text"
                    value={pokemonId}
                    onChange={(e) => setPokemonId(e.target.value )}
                    disabled={!isEditingGameIds}
                    className={`w-full px-3 py-2 border border-gray-300 rounded ${
                      isEditingGameIds 
                        ? 'focus:outline-none focus:ring-2 focus:ring-purple-600' 
                        : 'bg-gray-50 text-gray-900'
                    }`}
                  />
                </div>
                {/* <div>
                  <label className="block text-sm text-gray-600 mb-1">One Piece TCG ID</label>
                  <input
                    type="text"
                    value={gameIds.onePiece}
                    onChange={(e) => setGameIds({ ...gameIds, onePiece: e.target.value })}
                    disabled={!isEditingGameIds}
                    className={`w-full px-3 py-2 border border-gray-300 rounded ${
                      isEditingGameIds 
                        ? 'focus:outline-none focus:ring-2 focus:ring-purple-600' 
                        : 'bg-gray-50 text-gray-900'
                    }`}
                  />
                </div> */}
              </div>
            </div>

            {/* Store Selector & Transaction History */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl mb-4 text-gray-900">Carteira de Créditos</h2>
                <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                  {/* {stores.map((store) => (
                    <button
                      key={store.id}
                      onClick={() => setSelectedStore(store)}
                      className={`flex-shrink-0 px-4 py-2 rounded-lg border-2 transition-colors ${
                        selectedStore.id === store.id
                          ? 'border-purple-600 bg-purple-50 text-purple-600'
                          : 'border-gray-200 text-gray-700 hover:border-purple-300'
                      }`}
                    >
                      <div className="text-sm">{store.name}</div>
                      <div className="text-xs">${store.credits.toFixed(2)}</div>
                    </button>
                  ))} */}
                </div>
              </div>

              {/* Selected Store Details */}
              {/* <div className="p-6 bg-gradient-to-br from-purple-600 to-pink-600 text-white">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl mb-1">{selectedStore.name}</h3>
                    <p className="text-purple-100 text-sm">📍 {selectedStore.address}</p>
                  </div>
                  <Wallet className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-purple-100 text-sm mb-1">Current Balance</p>
                  <p className="text-4xl">${selectedStore.credits.toFixed(2)}</p>
                </div>
              </div> */}

              {/* Store Transaction History */}
              {/* <div className="p-6 border-t border-gray-200"> */}
                {/* <h3 className="text-lg mb-4 text-gray-900">Purchase History at {selectedStore.name}</h3> */}
                {/* <div className="space-y-3 max-h-96 overflow-y-auto">
                  {storeTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{transaction.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500">{transaction.date}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className={`text-xs ${
                            transaction.paymentMethod === 'Store Credit' 
                              ? 'text-purple-600' 
                              : transaction.paymentMethod === 'Hybrid'
                              ? 'text-blue-600'
                              : 'text-gray-600'
                          }`}>
                            {transaction.paymentMethod}
                          </span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className={`${
                          transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'credit' ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div> */}
              </div>
            </div>

            {/* Prize History Across All Stores */}
            {/* <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl text-gray-900">Prize History (All Stores)</h2>
              </div>
              <div className="divide-y divide-gray-200"> */}
                {/* {prizeHistory.map((prize) => (
                  <div key={prize.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-gray-900">{prize.tournament}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500">{prize.store}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">{prize.date}</span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                          {prize.placement}
                        </span>
                        <p className="text-green-600 mt-1">+${prize.amount.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))} */}
              {/* </div> */}
            {/* </div> */}
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-8">
            {/* Total Credits Across All Stores */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg shadow-lg p-6 text-white">
              <h3 className="text-lg mb-4">Créditos Totais</h3>
              <p className="text-5xl mb-2">R${totalCredits.toFixed(2)}</p>
              <p className="text-purple-100 text-sm">Somando {stores.length} lojas</p>
            </div>

            {/* All Store Balances */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg mb-4 text-gray-900">Registro por Loja</h3>
              <div className="space-y-3">
                {stores.map((store) => (
                  <div key={store.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Store className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-900">{store.nome_loja}</div>
                        <div className="text-xs text-gray-500">{store.endereco}</div>
                      </div>
                    </div>
                    <div className="text-purple-600">R${store.quantidade.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            {/* <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg mb-4 text-gray-900">Overall Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Prizes Won</span>
                  <span className="text-green-600">+$205.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Spent</span>
                  <span className="text-gray-600">-$154.48</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="text-sm text-gray-900">Net Balance</span>
                  <span className="text-purple-600">${totalCredits.toFixed(2)}</span>
                </div>
              </div>
            </div> */}
          </div>
        </div>
  );
}
