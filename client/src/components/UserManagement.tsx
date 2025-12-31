import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, UserPlus, ShieldCheck } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function UserManagement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ username: "", password: "", email: "", fullName: "", role: "writer" });

  // Fetch all users
  const { data: users, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
  });

  // Create User Mutation
  const createUser = useMutation({
    mutationFn: async (newUser: typeof formData) => {
      const res = await apiRequest("POST", "/api/users", newUser);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User Created", description: `${formData.fullName} has been added.` });
      setIsAdding(false);
      setFormData({ username: "", password: "", email: "", fullName: "", role: "writer" });
    },
  });

  if (isLoading) return <Loader2 className="animate-spin m-auto" />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Team Management</h2>
        <Button onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? "Cancel" : <><UserPlus className="mr-2 w-4 h-4" /> Add Member</>}
        </Button>
      </div>

      {isAdding && (
        <Card className="border-blue-500 shadow-md">
          <CardHeader><CardTitle>Add New Admin or Writer</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Input placeholder="Full Name" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
            <Input placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            <Input placeholder="Username" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
            <Input type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value})}
            >
              <option value="writer">Writer</option>
              <option value="admin">Administrator</option>
            </select>
            <Button onClick={() => createUser.mutate(formData)} disabled={createUser.isPending}>
              {createUser.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : "Confirm Add"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.fullName}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role === 'admin' && <ShieldCheck className="w-3 h-3 mr-1" />}
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
