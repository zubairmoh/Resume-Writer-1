import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export function AdminManagement() {
  const { toast } = useToast();
  const [newAdmin, setNewAdmin] = useState({ username: "", password: "", fullName: "" });

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Replace with your actual API call
      // await api.createAdmin(newAdmin);
      toast({ title: "Success", description: "New administrator added." });
      setNewAdmin({ username: "", password: "", fullName: "" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to add admin." });
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border">
      <h3 className="text-lg font-bold mb-4">Add New Administrator</h3>
      <form onSubmit={handleCreateAdmin} className="space-y-4">
        <div>
          <Label>Full Name</Label>
          <Input 
            value={newAdmin.fullName} 
            onChange={e => setNewAdmin({...newAdmin, fullName: e.target.value})} 
          />
        </div>
        <div>
          <Label>Username/Email</Label>
          <Input 
            value={newAdmin.username} 
            onChange={e => setNewAdmin({...newAdmin, username: e.target.value})} 
          />
        </div>
        <div>
          <Label>Password</Label>
          <Input 
            type="password" 
            value={newAdmin.password} 
            onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} 
          />
        </div>
        <Button type="submit">Create Admin Account</Button>
      </form>
    </div>
  );
}
