"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";
import { Plus, Trash2, Box, Layers, Edit2, Eye, EyeOff, FolderPlus, DatabaseZap } from "lucide-react";
import {
  addProductAction,
  deleteProductAction,
  editProductAction,
  toggleProductStatusAction,
  addSuiteAction,
  editSuiteAction,
  deleteSuiteAction,
  seedEcosystemAction
} from "../actions";
import type { EcosystemSuite } from "@/lib/types";

export function ClientProductsManager({ initialEcosystem }: { initialEcosystem: EcosystemSuite[] }) {
  const [ecosystem, setEcosystem] = useState<EcosystemSuite[]>(initialEcosystem);
  const [activeSuite, setActiveSuite] = useState<string>(ecosystem[0]?.slug ?? "");
  const [adding, setAdding] = useState(false);
  const [addingSuite, setAddingSuite] = useState(false);
  const [editingSuite, setEditingSuite] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [seeding, startSeed] = useTransition();
  const [seedError, setSeedError] = useState<string | null>(null);

  // ---------- PRODUCT ACTIONS ----------
  async function handleAddProduct(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const newProduct = {
      name: formData.get("name") as string,
      slug: (formData.get("name") as string).toLowerCase().replace(/\s+/g, '-'),
      description: formData.get("description") as string,
      nameAr: formData.get("nameAr") as string,
      descAr: formData.get("descAr") as string,
      order: parseInt(formData.get("order") as string) || 0,
      features: formData.get("features") as string,
      status: "PUBLISHED",
    };

    await addProductAction(activeSuite, newProduct);
    
    const updatedEcosystem = ecosystem.map(s => {
      if (s.slug === activeSuite) {
        return { ...s, products: [...(s.products || []), newProduct].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) };
      }
      return s;
    });
    setEcosystem(updatedEcosystem);
    setAdding(false);
    setLoading(false);
  }

  async function handleEditProduct(e: React.FormEvent<HTMLFormElement>, originalSlug: string) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const updatedProduct = {
      name: formData.get("name") as string,
      slug: originalSlug,
      description: formData.get("description") as string,
      nameAr: formData.get("nameAr") as string,
      descAr: formData.get("descAr") as string,
      order: parseInt(formData.get("order") as string) || 0,
      features: formData.get("features") as string,
    };

    await editProductAction(activeSuite, originalSlug, updatedProduct);
    
    const updatedEcosystem = ecosystem.map(s => {
      if (s.slug === activeSuite) {
        return { 
          ...s, 
          products: s.products.map((p) => p.slug === originalSlug ? { ...p, ...updatedProduct } : p)
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        };
      }
      return s;
    });
    setEcosystem(updatedEcosystem);
    setEditingProduct(null);
    setLoading(false);
  }

  async function handleToggleStatus(productSlug: string, currentStatus: string) {
    await toggleProductStatusAction(productSlug, currentStatus);
    const newStatus = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    const updatedEcosystem = ecosystem.map(s => {
      if (s.slug === activeSuite) {
        return { 
          ...s, 
          products: s.products.map((p) => p.slug === productSlug ? { ...p, status: newStatus } : p)
        };
      }
      return s;
    });
    setEcosystem(updatedEcosystem);
  }

  async function handleDeleteProduct(suiteSlug: string, productSlug: string) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    await deleteProductAction(suiteSlug, productSlug);
    
    const updatedEcosystem = ecosystem.map(s => {
      if (s.slug === suiteSlug) {
        return { ...s, products: s.products.filter((p) => p.slug !== productSlug) };
      }
      return s;
    });
    setEcosystem(updatedEcosystem);
  }

  // ---------- SUITE ACTIONS ----------
  async function handleAddSuite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const newSuite = {
      suite: formData.get("suite") as string,
      suiteAr: formData.get("suiteAr") as string,
      slug: (formData.get("suite") as string).toLowerCase().replace(/\s+/g, '-'),
      products: []
    };

    await addSuiteAction(newSuite);
    
    setEcosystem([...ecosystem, newSuite]);
    setActiveSuite(newSuite.slug);
    setAddingSuite(false);
    setLoading(false);
  }

  async function handleEditSuite(e: React.FormEvent<HTMLFormElement>, originalSlug: string) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const newSlug = (formData.get("suite") as string).toLowerCase().replace(/\s+/g, '-');
    const updatedSuite = {
      suite: formData.get("suite") as string,
      suiteAr: formData.get("suiteAr") as string,
      slug: newSlug,
    };

    await editSuiteAction(originalSlug, updatedSuite);
    
    const updatedEcosystem = ecosystem.map(s => {
      if (s.slug === originalSlug) {
        return { ...s, ...updatedSuite };
      }
      return s;
    });
    setEcosystem(updatedEcosystem);
    setActiveSuite(newSlug);
    setEditingSuite(null);
    setLoading(false);
  }

  async function handleDeleteSuite(suiteSlug: string) {
    if (!confirm("Are you sure you want to delete this suite? All products inside will also be deleted!")) return;
    await deleteSuiteAction(suiteSlug);
    
    const updatedEcosystem = ecosystem.filter(s => s.slug !== suiteSlug);
    setEcosystem(updatedEcosystem);
    if (activeSuite === suiteSlug && updatedEcosystem.length > 0) {
      setActiveSuite(updatedEcosystem[0].slug);
    }
  }

  const currentSuiteData = ecosystem.find(s => s.slug === activeSuite);
  const sortedProducts = [...(currentSuiteData?.products || [])].sort((a, b) => (a.order || 0) - (b.order || 0));

  if (ecosystem.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 border border-dashed border-fg/10 rounded-3xl text-center space-y-6">
        <DatabaseZap className="w-16 h-16 text-slate/30" />
        <div>
          <h3 className="text-2xl font-bold text-platinum mb-2">Database is empty</h3>
          <p className="text-slate max-w-md">No suites or products found. Click below to seed the database with the default Grow ecosystem catalog.</p>
        </div>
        {seedError && (
          <p className="text-sm text-red-400 max-w-sm">{seedError}</p>
        )}
        <button
          onClick={() => {
            setSeedError(null);
            startSeed(async () => {
              const result = await seedEcosystemAction();
              if (result.success) {
                window.location.reload();
              } else {
                setSeedError(result.error ?? "Seeding failed. Please try again.");
              }
            });
          }}
          disabled={seeding}
          className="px-8 py-3 bg-cyan text-void font-bold rounded-xl hover:bg-cyan/90 disabled:opacity-50 flex items-center gap-2"
        >
          <DatabaseZap className="w-5 h-5" />
          {seeding ? "Seeding…" : "Seed from Default Catalog"}
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar Suites List */}
      <div className="lg:col-span-1 space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-sm font-bold text-slate uppercase tracking-wider">Suites</h2>
          <button
            onClick={() => { setAddingSuite(true); setEditingSuite(null); setAdding(false); setEditingProduct(null); }}
            className="p-1 rounded bg-cyan/10 text-cyan hover:bg-cyan hover:text-void transition-colors"
            title="Add Suite"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-2">
          {ecosystem.map((suite) => (
            <div key={suite.slug} className="group relative flex items-center">
              <button
                onClick={() => { setActiveSuite(suite.slug); setAdding(false); setEditingProduct(null); setAddingSuite(false); setEditingSuite(null); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors text-left pr-16 ${
                  activeSuite === suite.slug 
                    ? "bg-amethyst/10 border border-amethyst/30 text-platinum font-bold" 
                    : "bg-obsidian border border-fg/5 text-slate hover:bg-fg/5 hover:text-platinum"
                }`}
              >
                <Layers className={`w-5 h-5 flex-shrink-0 ${activeSuite === suite.slug ? "text-amethyst" : "text-slate/50"}`} />
                <span className="truncate">{suite.suite}</span>
              </button>
              
              <div className="absolute right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => { setEditingSuite(suite.slug); setAddingSuite(false); setActiveSuite(suite.slug); }}
                  className="p-1.5 rounded text-slate hover:text-cyan hover:bg-cyan/10"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button 
                  onClick={() => handleDeleteSuite(suite.slug)}
                  className="p-1.5 rounded text-slate hover:text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-3">
        {addingSuite && (
          <Card className="p-6 mb-8 border-amethyst/30 bg-obsidian">
            <h3 className="text-xl font-bold text-platinum mb-4 border-b border-fg/10 pb-2 flex items-center">
              <FolderPlus className="w-5 h-5 mr-2 text-amethyst" /> Create New Suite
            </h3>
            <form onSubmit={handleAddSuite} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate uppercase">Suite Name (EN)</label>
                  <input name="suite" required className="w-full px-4 py-2 bg-void border border-fg/10 rounded-lg text-platinum focus:border-amethyst outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate uppercase">Suite Name (AR)</label>
                  <input name="suiteAr" required className="w-full px-4 py-2 bg-void border border-fg/10 rounded-lg text-platinum focus:border-amethyst outline-none text-right font-arabic" dir="rtl" />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setAddingSuite(false)} className="px-4 py-2 rounded-lg text-slate hover:bg-fg/5">Cancel</button>
                <button type="submit" disabled={loading} className="px-6 py-2 bg-amethyst text-void font-bold rounded-lg hover:bg-amethyst/90 disabled:opacity-50">
                  {loading ? "Saving..." : "Create Suite"}
                </button>
              </div>
            </form>
          </Card>
        )}

        {editingSuite && currentSuiteData && editingSuite === currentSuiteData.slug && (
          <Card className="p-6 mb-8 border-amethyst/30 bg-obsidian">
            <h3 className="text-xl font-bold text-platinum mb-4 border-b border-fg/10 pb-2 flex items-center">
              <Edit2 className="w-5 h-5 mr-2 text-amethyst" /> Edit Suite
            </h3>
            <form onSubmit={(e) => handleEditSuite(e, currentSuiteData.slug)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate uppercase">Suite Name (EN)</label>
                  <input name="suite" defaultValue={currentSuiteData.suite} required className="w-full px-4 py-2 bg-void border border-fg/10 rounded-lg text-platinum focus:border-amethyst outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate uppercase">Suite Name (AR)</label>
                  <input name="suiteAr" defaultValue={currentSuiteData.suiteAr} required className="w-full px-4 py-2 bg-void border border-fg/10 rounded-lg text-platinum focus:border-amethyst outline-none text-right font-arabic" dir="rtl" />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setEditingSuite(null)} className="px-4 py-2 rounded-lg text-slate hover:bg-fg/5">Cancel</button>
                <button type="submit" disabled={loading} className="px-6 py-2 bg-amethyst text-void font-bold rounded-lg hover:bg-amethyst/90 disabled:opacity-50">
                  {loading ? "Saving..." : "Save Suite"}
                </button>
              </div>
            </form>
          </Card>
        )}

        {!addingSuite && !editingSuite && currentSuiteData && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-platinum">{currentSuiteData.suite}</h2>
              </div>
              <button 
                onClick={() => { setAdding(!adding); setEditingProduct(null); }}
                className="flex items-center space-x-2 px-4 py-2 bg-cyan/10 text-cyan border border-cyan/20 rounded-lg hover:bg-cyan hover:text-void font-bold transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>

            {adding && (
              <Card className="p-6 mb-8 border-cyan/30 bg-obsidian">
                <h3 className="text-lg font-bold text-platinum mb-4 border-b border-fg/10 pb-2">Add New Product to {currentSuiteData.suite}</h3>
                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate uppercase">Name (EN)</label>
                      <input name="name" required className="w-full px-4 py-2 bg-void border border-fg/10 rounded-lg text-platinum focus:border-cyan outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate uppercase">Name (AR)</label>
                      <input name="nameAr" required className="w-full px-4 py-2 bg-void border border-fg/10 rounded-lg text-platinum focus:border-cyan outline-none text-right font-arabic" dir="rtl" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate uppercase">Description (EN)</label>
                      <textarea name="description" required rows={2} className="w-full px-4 py-2 bg-void border border-fg/10 rounded-lg text-platinum focus:border-cyan outline-none resize-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate uppercase">Description (AR)</label>
                      <textarea name="descAr" required rows={2} className="w-full px-4 py-2 bg-void border border-fg/10 rounded-lg text-platinum focus:border-cyan outline-none resize-none text-right font-arabic" dir="rtl" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate uppercase">Features / Tags (Comma separated)</label>
                      <input name="features" placeholder="e.g. AI-Powered, Cloud, Automation" className="w-full px-4 py-2 bg-void border border-fg/10 rounded-lg text-platinum focus:border-cyan outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate uppercase">Display Order (0 is first)</label>
                      <input name="order" type="number" defaultValue="0" className="w-full px-4 py-2 bg-void border border-fg/10 rounded-lg text-platinum focus:border-cyan outline-none" />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button type="button" onClick={() => setAdding(false)} className="px-4 py-2 rounded-lg text-slate hover:bg-fg/5">Cancel</button>
                    <button type="submit" disabled={loading} className="px-6 py-2 bg-cyan text-void font-bold rounded-lg hover:bg-cyan/90 disabled:opacity-50">
                      {loading ? "Saving..." : "Save Product"}
                    </button>
                  </div>
                </form>
              </Card>
            )}

            {sortedProducts.length === 0 ? (
              <div className="text-center p-12 border border-fg/10 rounded-xl bg-obsidian">
                <Box className="w-12 h-12 text-slate/30 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-platinum mb-2">No Products Found</h3>
                <p className="text-slate">This suite is currently empty. Add a product to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {sortedProducts.map((product) => (
                  <Card key={product.slug} className={`p-5 border-fg/10 bg-obsidian group ${product.status === 'DRAFT' ? 'opacity-70' : ''}`}>
                    {editingProduct === product.slug ? (
                      <form onSubmit={(e) => handleEditProduct(e, product.slug)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate uppercase">Name (EN)</label>
                            <input name="name" defaultValue={product.name} required className="w-full px-3 py-1.5 bg-void border border-fg/10 rounded text-sm text-platinum focus:border-cyan outline-none" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate uppercase">Name (AR)</label>
                            <input name="nameAr" defaultValue={product.nameAr} required className="w-full px-3 py-1.5 bg-void border border-fg/10 rounded text-sm text-platinum focus:border-cyan outline-none text-right font-arabic" dir="rtl" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate uppercase">Description (EN)</label>
                            <textarea name="description" defaultValue={product.description} required rows={2} className="w-full px-3 py-1.5 bg-void border border-fg/10 rounded text-sm text-platinum focus:border-cyan outline-none resize-none" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate uppercase">Description (AR)</label>
                            <textarea name="descAr" defaultValue={product.descAr} required rows={2} className="w-full px-3 py-1.5 bg-void border border-fg/10 rounded text-sm text-platinum focus:border-cyan outline-none resize-none text-right font-arabic" dir="rtl" />
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div className="space-y-2 flex-1">
                            <label className="text-xs font-bold text-slate uppercase">Features (Comma separated)</label>
                            <input name="features" defaultValue={product.features || ""} className="w-full px-3 py-1.5 bg-void border border-fg/10 rounded text-sm text-platinum focus:border-cyan outline-none" />
                          </div>
                          <div className="space-y-2 w-24">
                            <label className="text-xs font-bold text-slate uppercase">Order</label>
                            <input name="order" type="number" defaultValue={product.order || 0} className="w-full px-3 py-1.5 bg-void border border-fg/10 rounded text-sm text-platinum focus:border-cyan outline-none" />
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2 pt-2 border-t border-fg/10">
                          <button type="button" onClick={() => setEditingProduct(null)} className="px-3 py-1.5 text-xs rounded-md text-slate hover:bg-fg/5">Cancel</button>
                          <button type="submit" disabled={loading} className="px-4 py-1.5 text-xs bg-cyan text-void font-bold rounded-md hover:bg-cyan/90 disabled:opacity-50">Save</button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex flex-col h-full justify-between">
                        <div>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Box className={`w-4 h-4 ${product.status === 'PUBLISHED' ? 'text-cyan' : 'text-slate'}`} />
                              <h4 className="font-bold text-platinum text-lg">{product.name}</h4>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${product.status === 'PUBLISHED' ? 'bg-green-500/10 text-green-400' : 'bg-slate/10 text-slate'}`}>
                              {product.status || 'PUBLISHED'}
                            </span>
                          </div>
                          <h5 className="font-arabic text-slate/80 text-sm mb-3" dir="rtl">{product.nameAr}</h5>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-slate">{product.description}</p>
                            </div>
                            <div className="text-right" dir="rtl">
                              <p className="text-xs text-slate font-arabic">{product.descAr}</p>
                            </div>
                          </div>
                          
                          {product.features && (
                            <div className="flex flex-wrap gap-1 mb-4">
                              {product.features.split(',').map((f: string, i: number) => {
                                const feature = f.trim();
                                if (!feature) return null;
                                return (
                                  <span key={i} className="text-[10px] px-2 py-0.5 bg-cyan/10 text-cyan border border-cyan/20 rounded font-medium">
                                    {feature}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-fg/5">
                          <div className="text-xs text-slate/50">Order: {product.order || 0}</div>
                          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleToggleStatus(product.slug, product.status || 'PUBLISHED')}
                              title={product.status === 'PUBLISHED' ? "Switch to Draft" : "Publish"}
                              className="p-1.5 rounded-md text-slate hover:text-platinum hover:bg-fg/10 transition-colors"
                            >
                              {product.status === 'PUBLISHED' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button 
                              onClick={() => setEditingProduct(product.slug)}
                              title="Edit Product"
                              className="p-1.5 rounded-md text-slate hover:text-cyan hover:bg-cyan/10 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(currentSuiteData.slug, product.slug)}
                              title="Delete Product"
                              className="p-1.5 rounded-md text-slate hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
