
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from '@/services/api';
import { NozzleReading } from '@/types/api';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function NozzleReadings() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingReading, setEditingReading] = useState<NozzleReading | null>(null);
  const [newReading, setNewReading] = useState({
    pump_sno: '',
    nozzle_id: 1,
    cumulative_volume: 0,
    reading_date: new Date().toISOString().split('T')[0],
    reading_time: new Date().toTimeString().slice(0, 5),
    fuel_type: 'Petrol' as 'Petrol' | 'Diesel'
  });

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const currentStation = user?.stations?.[0];

  const { data: readingsData, isLoading } = useQuery({
    queryKey: ['nozzle-readings', currentStation?.id],
    queryFn: async () => {
      if (!currentStation) return { data: [] };
      return await apiService.getNozzleReadings(currentStation.id);
    },
    enabled: !!currentStation
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof newReading) => {
      if (!currentStation) throw new Error('No station selected');
      return apiService.createManualReading(data, currentStation.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nozzle-readings'] });
      setShowAddDialog(false);
      setNewReading({
        pump_sno: '',
        nozzle_id: 1,
        cumulative_volume: 0,
        reading_date: new Date().toISOString().split('T')[0],
        reading_time: new Date().toTimeString().slice(0, 5),
        fuel_type: 'Petrol' as 'Petrol' | 'Diesel'
      });
      toast({
        title: "Success",
        description: "Reading added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add reading",
        variant: "destructive",
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { cumulative_volume: number; fuel_type: 'Petrol' | 'Diesel' } }) =>
      apiService.updateNozzleReading(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nozzle-readings'] });
      setEditingReading(null);
      toast({
        title: "Success",
        description: "Reading updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error", 
        description: error.message || "Failed to update reading",
        variant: "destructive",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiService.deleteNozzleReading(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nozzle-readings'] });
      toast({
        title: "Success",
        description: "Reading deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete reading",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newReading);
  };

  const handleEdit = (reading: NozzleReading) => {
    setEditingReading(reading);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingReading) {
      updateMutation.mutate({
        id: editingReading.id,
        data: {
          cumulative_volume: editingReading.cumulativeVolume,
          fuel_type: editingReading.fuelType as 'Petrol' | 'Diesel'
        }
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this reading?')) {
      deleteMutation.mutate(id);
    }
  };

  const readings = readingsData?.data || [];

  const getStatusBadge = (isManual: boolean) => {
    return isManual ? (
      <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200">
        Manual
      </Badge>
    ) : (
      <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">
        OCR
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Nozzle Readings</h1>
          <p className="text-muted-foreground mt-1">
            View and manage fuel nozzle readings from OCR and manual entries.
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>Add Manual Reading</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Manual Reading</DialogTitle>
              <DialogDescription>
                Enter the nozzle reading manually
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="pump_sno">Pump Serial Number</Label>
                <Input
                  id="pump_sno"
                  value={newReading.pump_sno}
                  onChange={(e) => setNewReading(prev => ({ ...prev, pump_sno: e.target.value }))}
                  placeholder="e.g., P001"
                  required
                />
              </div>

              <div>
                <Label htmlFor="nozzle_id">Nozzle ID</Label>
                <Select
                  value={newReading.nozzle_id.toString()}
                  onValueChange={(value) => setNewReading(prev => ({ ...prev, nozzle_id: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Nozzle 1</SelectItem>
                    <SelectItem value="2">Nozzle 2</SelectItem>
                    <SelectItem value="3">Nozzle 3</SelectItem>
                    <SelectItem value="4">Nozzle 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="fuel_type">Fuel Type</Label>
                <Select
                  value={newReading.fuel_type}
                  onValueChange={(value: 'Petrol' | 'Diesel') => setNewReading(prev => ({ ...prev, fuel_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Petrol">Petrol</SelectItem>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="cumulative_volume">Cumulative Volume (L)</Label>
                <Input
                  id="cumulative_volume"
                  type="number"
                  step="0.001"
                  value={newReading.cumulative_volume}
                  onChange={(e) => setNewReading(prev => ({ ...prev, cumulative_volume: parseFloat(e.target.value) || 0 }))}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reading_date">Date</Label>
                  <Input
                    id="reading_date"
                    type="date"
                    value={newReading.reading_date}
                    onChange={(e) => setNewReading(prev => ({ ...prev, reading_date: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="reading_time">Time</Label>
                  <Input
                    id="reading_time"
                    type="time"
                    value={newReading.reading_time}
                    onChange={(e) => setNewReading(prev => ({ ...prev, reading_time: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Adding...' : 'Add Reading'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Readings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Readings</CardTitle>
          <CardDescription>
            Latest nozzle readings from OCR processing and manual entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <span className="text-2xl">⏳</span>
              <p className="text-muted-foreground mt-2">Loading readings...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {readings.map((reading) => (
                <div key={reading.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{reading.fuelType === 'Petrol' ? '⛽' : '🚛'}</span>
                    <div>
                      <p className="font-medium">
                        {reading.pumpSno} - Nozzle {reading.nozzleId}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(reading.readingDate).toLocaleDateString()} at {reading.readingTime}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{reading.fuelType}</Badge>
                        {getStatusBadge(reading.isManualEntry)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">{reading.cumulativeVolume.toLocaleString()}L</p>
                      <p className="text-sm text-muted-foreground">Cumulative</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const mappedReading: NozzleReading = {
                            id: reading.id,
                            userId: reading.userId,
                            pumpSno: reading.pumpSno,
                            nozzleId: reading.nozzleId,
                            fuelType: reading.fuelType as 'Petrol' | 'Diesel',
                            cumulativeVolume: reading.cumulativeVolume,
                            readingDate: reading.readingDate,
                            readingTime: reading.readingTime,
                            isManualEntry: reading.isManualEntry,
                            createdAt: reading.createdAt,
                            updatedAt: reading.updatedAt
                          };
                          handleEdit(mappedReading);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(reading.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {readings.length === 0 && (
                <div className="text-center py-8">
                  <span className="text-4xl">📊</span>
                  <p className="text-muted-foreground mt-2">No readings yet</p>
                  <p className="text-sm text-muted-foreground">Upload receipts or add manual readings to get started</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingReading && (
        <Dialog open={!!editingReading} onOpenChange={() => setEditingReading(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Reading</DialogTitle>
              <DialogDescription>
                Update the nozzle reading details
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <Label>Pump: {editingReading.pumpSno} - Nozzle {editingReading.nozzleId}</Label>
              </div>

              <div>
                <Label htmlFor="edit_fuel_type">Fuel Type</Label>
                <Select
                  value={editingReading.fuelType}
                  onValueChange={(value: 'Petrol' | 'Diesel') => 
                    setEditingReading(prev => prev ? { ...prev, fuelType: value } : null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Petrol">Petrol</SelectItem>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit_cumulative_volume">Cumulative Volume (L)</Label>
                <Input
                  id="edit_cumulative_volume"
                  type="number"
                  step="0.001"
                  value={editingReading.cumulativeVolume}
                  onChange={(e) => 
                    setEditingReading(prev => prev ? { ...prev, cumulativeVolume: parseFloat(e.target.value) || 0 } : null)
                  }
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Updating...' : 'Update Reading'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditingReading(null)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
