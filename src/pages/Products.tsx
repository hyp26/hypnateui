import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProductStore } from '../stores/useProductStore';
import { Plus, Edit2, Trash2, Search, Filter } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { formatCurrency } from '../lib/utils';

export const Products = () => {
  const { products } = useProductStore();
  const [view, setView] = useState<'grid' | 'table'>('table');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Link to="/products/new">
  `       <Button>
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Button>
        </Link>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
          />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium">
            <tr>
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                    />
                    <span className="font-medium text-gray-900">{product.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">{product.category}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    product.stock > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {product.stock} in stock
                  </span>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">{formatCurrency(product.price)}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
