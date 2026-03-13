import * as React from "react";
import { Layout } from "@/components/layout";
import { 
  useListAllProfiles, 
  useCreateProfile, 
  useUpdateProfile, 
  useDeleteProfile, 
  useToggleProfile 
} from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LockKeyhole, Plus, Pencil, Trash2, Power, PowerOff, ShieldCheck } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { getListAllProfilesQueryKey, getListProfilesQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  age: z.coerce.number().min(18, "Must be at least 18"),
  location: z.string().min(2, "Location is required"),
  bio: z.string().min(10, "Bio should be descriptive"),
  whatsapp: z.string().min(8, "Enter a valid phone number with country code"),
  photoUrl: z.string().optional().default(""),
  active: z.boolean().default(true),
  verified: z.boolean().default(false),
  interests: z.array(z.object({ value: z.string() })).min(1, "Add at least one interest"),
});

type FormValues = z.infer<typeof formSchema>;

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      setIsAuthenticated(true);
    } else {
      toast({ title: "Error", description: "Incorrect password", variant: "destructive" });
    }
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-2xl">
            <CardContent className="p-8 flex flex-col items-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
                <LockKeyhole className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-serif font-bold mb-2">Admin Access</h1>
              <p className="text-muted-foreground text-center mb-8">Enter the master password to manage profiles.</p>
              
              <form onSubmit={handleLogin} className="w-full space-y-4">
                <Input 
                  type="password" 
                  placeholder="Password..." 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-center"
                />
                <Button type="submit" className="w-full">Unlock Dashboard</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: profiles, isLoading } = useListAllProfiles();
  
  const createMut = useCreateProfile();
  const updateMut = useUpdateProfile();
  const deleteMut = useDeleteProfile();
  const toggleMut = useToggleProfile();

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: getListAllProfilesQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListProfilesQueryKey() });
  };

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "", age: 25, location: "", bio: "", whatsapp: "", photoUrl: "", active: true, verified: false,
      interests: [{ value: "" }]
    }
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "interests" });

  const openAdd = () => {
    setEditingId(null);
    form.reset({
      name: "", age: 25, location: "", bio: "", whatsapp: "", photoUrl: "", active: true, verified: false,
      interests: [{ value: "" }]
    });
    setDialogOpen(true);
  };

  const openEdit = (profile: any) => {
    setEditingId(profile.id);
    form.reset({
      name: profile.name,
      age: profile.age,
      location: profile.location,
      bio: profile.bio,
      whatsapp: profile.whatsapp,
      photoUrl: profile.photoUrl || "",
      active: profile.active,
      verified: profile.verified,
      interests: profile.interests.map((i: string) => ({ value: i }))
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      const payload = {
        ...data,
        interests: data.interests.map(i => i.value).filter(Boolean)
      };

      if (editingId) {
        await updateMut.mutateAsync({ id: editingId, data: payload });
        toast({ title: "Success", description: "Profile updated" });
      } else {
        await createMut.mutateAsync({ data: payload });
        toast({ title: "Success", description: "Profile created" });
      }
      invalidateQueries();
      setDialogOpen(false);
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to save", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this profile permanently?")) {
      try {
        await deleteMut.mutateAsync({ id });
        toast({ title: "Success", description: "Profile deleted" });
        invalidateQueries();
      } catch (e) {
        toast({ title: "Error", variant: "destructive" });
      }
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await toggleMut.mutateAsync({ id });
      invalidateQueries();
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  return (
    <Layout>
      <div className="py-10 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold">Manage Profiles</h1>
            <p className="text-muted-foreground">Admin dashboard for Lumière directory.</p>
          </div>
          <Button onClick={openAdd} className="shadow-lg"><Plus className="w-4 h-4 mr-2" /> Add New Profile</Button>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4">Profile</th>
                  <th className="px-6 py-4">Details</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">Loading profiles...</td></tr>
                ) : profiles?.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No profiles found in database.</td></tr>
                ) : profiles?.map((p) => (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent overflow-hidden shrink-0">
                          {p.photoUrl ? (
                            <img src={p.photoUrl} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-serif text-accent-foreground font-bold">{p.name.charAt(0)}</div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold flex items-center gap-1 text-foreground">
                            {p.name}, {p.age} 
                            {p.verified && <ShieldCheck className="w-3 h-3 text-primary" />}
                          </div>
                          <div className="text-xs text-muted-foreground">{p.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-[200px] truncate text-muted-foreground" title={p.whatsapp}>{p.whatsapp}</div>
                      <div className="text-xs text-muted-foreground mt-1">{p.interests?.length || 0} interests</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={p.active ? "default" : "secondary"}>
                        {p.active ? "Active" : "Hidden"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => handleToggle(p.id)}
                          title={p.active ? "Deactivate" : "Activate"}
                        >
                          {p.active ? <PowerOff className="w-4 h-4 text-muted-foreground" /> : <Power className="w-4 h-4 text-primary" />}
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => openEdit(p)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(p.id)} className="text-destructive hover:bg-destructive/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogHeader>
          <DialogTitle>{editingId ? "Edit Profile" : "Add New Profile"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Name</label>
              <Input {...form.register("name")} placeholder="Jane Doe" />
              {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Age</label>
              <Input type="number" {...form.register("age")} />
              {form.formState.errors.age && <p className="text-xs text-destructive">{form.formState.errors.age.message}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Location</label>
              <Input {...form.register("location")} placeholder="City, Country" />
              {form.formState.errors.location && <p className="text-xs text-destructive">{form.formState.errors.location.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">WhatsApp (inc. country code)</label>
              <Input {...form.register("whatsapp")} placeholder="+1234567890" />
              {form.formState.errors.whatsapp && <p className="text-xs text-destructive">{form.formState.errors.whatsapp.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Photo URL (optional)</label>
            <Input {...form.register("photoUrl")} placeholder="https://example.com/photo.jpg" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Bio</label>
            <textarea 
              {...form.register("bio")} 
              className="w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm min-h-[100px]"
              placeholder="Tell us about her..."
            />
            {form.formState.errors.bio && <p className="text-xs text-destructive">{form.formState.errors.bio.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground flex justify-between">
              Interests 
              <button type="button" onClick={() => append({ value: "" })} className="text-primary hover:underline">Add Interest</button>
            </label>
            <div className="flex flex-wrap gap-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-1 w-[calc(50%-0.25rem)]">
                  <Input {...form.register(`interests.${index}.value`)} placeholder="e.g. Travel" className="h-9" />
                  <button type="button" onClick={() => remove(index)} className="p-2 text-destructive"><X size={16}/></button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2 pb-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" {...form.register("active")} className="w-4 h-4 accent-primary" />
              Visible on Site
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer text-primary font-medium">
              <input type="checkbox" {...form.register("verified")} className="w-4 h-4 accent-primary" />
              Verified Badge
            </label>
          </div>

          <div className="flex gap-3 mt-6">
            <Button type="button" variant="outline" className="w-full" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" className="w-full" isLoading={createMut.isPending || updateMut.isPending}>
              {editingId ? "Save Changes" : "Create Profile"}
            </Button>
          </div>
        </form>
      </Dialog>
    </Layout>
  );
}

// Quick inline X icon for the form
const X = ({ size = 24 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
