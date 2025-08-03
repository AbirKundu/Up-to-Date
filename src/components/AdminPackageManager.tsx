import { useState } from 'react';
import { useAdminPackages, SubscriptionPackage } from '@/hooks/useAdminPackages';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Package, RefreshCw } from 'lucide-react';

const AdminPackageManager = () => {
  const { packages, loading, createPackage, updatePackage, deletePackage, refetch } = useAdminPackages();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<SubscriptionPackage | null>(null);
  const [packageForm, setPackageForm] = useState({
    name: '',
    description: '',
    price: '',
    billing_cycle: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly',
    features: '',
    is_active: true,
  });

  const resetForm = () => {
    setPackageForm({
      name: '',
      description: '',
      price: '',
      billing_cycle: 'monthly',
      features: '',
      is_active: true,
    });
  };

  const handleCreatePackage = async () => {
    if (!packageForm.name || !packageForm.price) return;

    const result = await createPackage({
      name: packageForm.name,
      description: packageForm.description,
      price: parseFloat(packageForm.price),
      currency: 'BDT',
      billing_cycle: packageForm.billing_cycle,
      features: packageForm.features ? packageForm.features.split('\n').filter(f => f.trim()) : [],
      is_active: packageForm.is_active,
    });

    if (result) {
      setIsCreateDialogOpen(false);
      resetForm();
    }
  };

  const handleEditPackage = (pkg: SubscriptionPackage) => {
    setEditingPackage(pkg);
    setPackageForm({
      name: pkg.name,
      description: pkg.description || '',
      price: pkg.price.toString(),
      billing_cycle: pkg.billing_cycle,
      features: Array.isArray(pkg.features) ? pkg.features.join('\n') : (pkg.features || ''),
      is_active: pkg.is_active,
    });
  };

  const handleUpdatePackage = async () => {
    if (!editingPackage || !packageForm.name || !packageForm.price) return;

    const result = await updatePackage(editingPackage.id, {
      name: packageForm.name,
      description: packageForm.description,
      price: parseFloat(packageForm.price),
      billing_cycle: packageForm.billing_cycle,
      features: packageForm.features ? packageForm.features.split('\n').filter(f => f.trim()) : [],
      is_active: packageForm.is_active,
    });

    if (result) {
      setEditingPackage(null);
      resetForm();
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (confirm('Are you sure you want to delete this subscription package? This action cannot be undone.')) {
      await deletePackage(id);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading subscription packages...</p>
          </div>
        </div>
      </div>
    );
  }

  const PackageForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Package Name</Label>
        <Input
          id="name"
          value={packageForm.name}
          onChange={(e) => setPackageForm(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter package name"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={packageForm.description}
          onChange={(e) => setPackageForm(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Enter package description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price (BDT)</Label>
          <Input
            id="price"
            type="number"
            value={packageForm.price}
            onChange={(e) => setPackageForm(prev => ({ ...prev, price: e.target.value }))}
            placeholder="0.00"
          />
        </div>

        <div>
          <Label htmlFor="billing_cycle">Billing Cycle</Label>
          <Select value={packageForm.billing_cycle} onValueChange={(value: any) => setPackageForm(prev => ({ ...prev, billing_cycle: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="features">Features (one per line)</Label>
        <Textarea
          id="features"
          value={packageForm.features}
          onChange={(e) => setPackageForm(prev => ({ ...prev, features: e.target.value }))}
          placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
          rows={4}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={packageForm.is_active}
          onCheckedChange={(checked) => setPackageForm(prev => ({ ...prev, is_active: checked }))}
        />
        <Label htmlFor="is_active">Active Package</Label>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Subscription Package Management</h1>
          <p className="text-muted-foreground">Create and manage subscription packages for users to purchase</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Package
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Subscription Package</DialogTitle>
                <DialogDescription>
                  Create a new subscription package that users can purchase
                </DialogDescription>
              </DialogHeader>
              <PackageForm />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePackage} disabled={!packageForm.name || !packageForm.price}>
                  Create Package
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {packages.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No packages created yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first subscription package to get started
            </p>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Package
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="h-full flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {pkg.name}
                      {!pkg.is_active && <Badge variant="secondary">Inactive</Badge>}
                    </CardTitle>
                    <CardDescription>{pkg.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-3">
                  <div className="text-2xl font-bold text-primary">
                    ৳{pkg.price}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{pkg.billing_cycle}
                    </span>
                  </div>
                  <Badge variant="outline">{pkg.billing_cycle}</Badge>
                  {pkg.features && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Features:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {Array.isArray(pkg.features) ? pkg.features.map((feature: string, index: number) => (
                          <li key={index}>• {feature}</li>
                        )) : (
                          <li>• {pkg.features}</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
              <div className="p-6 pt-0 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEditPackage(pkg)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDeletePackage(pkg.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      {editingPackage && (
        <Dialog open={!!editingPackage} onOpenChange={() => setEditingPackage(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Subscription Package</DialogTitle>
              <DialogDescription>
                Update the subscription package details
              </DialogDescription>
            </DialogHeader>
            <PackageForm />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingPackage(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdatePackage} disabled={!packageForm.name || !packageForm.price}>
                Update Package
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminPackageManager;