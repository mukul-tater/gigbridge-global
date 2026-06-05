import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { adminNavGroups, adminProfileMenu } from "@/config/adminNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { CheckCircle, XCircle, Eye, Search, ShieldOff, ShieldCheck, Store, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Partner = any;

const STATUS_TABS = [
  { key: "pending", label: "Pending", statuses: ["applied", "under_review"] },
  { key: "approved", label: "Approved", statuses: ["approved"] },
  { key: "active", label: "Active", statuses: ["active"] },
  { key: "suspended", label: "Suspended", statuses: ["suspended"] },
  { key: "rejected", label: "Rejected", statuses: ["rejected"] },
] as const;

const BUCKET = "partner-documents";

export default function PartnerApprovals() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<(typeof STATUS_TABS)[number]["key"]>("pending");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Partner | null>(null);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [actionDialog, setActionDialog] = useState<null | { action: "approve" | "reject" | "suspend" | "reactivate"; partner: Partner }>(null);
  const [reason, setReason] = useState("");
  const [acting, setActing] = useState(false);

  const fetchRows = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("partner_profiles")
      .select("*")
      .not("submitted_at", "is", null)
      .order("submitted_at", { ascending: false });
    setRows(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchRows(); }, []);

  const openDetail = async (p: Partner) => {
    setSelected(p);
    setSignedUrls({});
    const fields = ["aadhaar_front_url", "aadhaar_back_url", "pan_card_url", "shop_photo_url"];
    const next: Record<string, string> = {};
    for (const f of fields) {
      const path: string | null = p[f];
      if (!path) continue;
      const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
      if (data?.signedUrl) next[f] = data.signedUrl;
    }
    setSignedUrls(next);
  };

  const filtered = rows.filter(r => {
    const tabMatch = (STATUS_TABS.find(t => t.key === tab)?.statuses as readonly string[]).includes(r.status);
    const q = search.trim().toLowerCase();
    const searchMatch = !q || [r.center_name, r.owner_name, r.email, r.mobile, r.district, r.state].some(v => (v || "").toLowerCase().includes(q));
    return tabMatch && searchMatch;
  });

  const submitAction = async () => {
    if (!actionDialog || !user) return;
    const { action, partner } = actionDialog;
    if ((action === "reject" || action === "suspend") && !reason.trim()) {
      toast.error("Please provide a reason");
      return;
    }
    setActing(true);
    try {
      const patch: Record<string, any> = { reviewed_by: user.id, reviewed_at: new Date().toISOString() };
      if (action === "approve") patch.status = "active";
      else if (action === "reject") { patch.status = "rejected"; patch.rejection_reason = reason; }
      else if (action === "suspend") { patch.status = "suspended"; patch.rejection_reason = reason; }
      else if (action === "reactivate") { patch.status = "active"; patch.rejection_reason = null; }

      const { error } = await supabase.from("partner_profiles").update(patch).eq("id", partner.id);
      if (error) throw error;

      await supabase.from("admin_actions").insert({
        admin_id: user.id,
        target_type: "partner_profile",
        target_id: partner.id,
        action,
        reason: reason || null,
        metadata: { partner_user_id: partner.user_id, center_name: partner.center_name },
      });

      // Notify partner
      await supabase.from("notifications").insert({
        user_id: partner.user_id,
        type: "partner_status",
        title: action === "approve" ? "Partner application approved" :
               action === "reject" ? "Partner application rejected" :
               action === "suspend" ? "Partner account suspended" : "Partner account reactivated",
        message: action === "approve" ? "Welcome aboard! You can now register workers." :
                 reason || `Your partner account status was changed to ${patch.status}.`,
        is_read: false,
      });

      toast.success("Action recorded");
      setActionDialog(null);
      setReason("");
      setSelected(null);
      await fetchRows();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed");
    } finally {
      setActing(false);
    }
  };

  return (
    <DashboardLayout navGroups={adminNavGroups} portalLabel="Admin Panel" portalName="Admin Panel" profileMenuItems={adminProfileMenu}>
      <h1 className="text-2xl md:text-3xl font-bold mb-2">Partner Approvals</h1>
      <p className="text-muted-foreground text-sm mb-6">Review e-Mitra partner applications and manage their account status.</p>

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by center, owner, email, mobile, district…" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Tabs value={tab} onValueChange={v => setTab(v as any)}>
        <TabsList className="mb-4 flex flex-wrap h-auto">
          {STATUS_TABS.map(t => (
            <TabsTrigger key={t.key} value={t.key}>
              {t.label}{" "}
              <Badge variant="secondary" className="ml-2 text-[10px]">
                {rows.filter(r => (t.statuses as readonly string[]).includes(r.status)).length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {STATUS_TABS.map(t => (
          <TabsContent key={t.key} value={t.key} className="space-y-3">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
            ) : filtered.length === 0 ? (
              <Card className="p-12 text-center text-muted-foreground">
                <Store className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p>No partners in this view.</p>
              </Card>
            ) : filtered.map(p => (
              <Card key={p.id} className="p-4 md:p-5">
                <div className="flex flex-col sm:flex-row justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-base truncate">{p.center_name || "Unnamed Center"}</h3>
                      <Badge variant="outline">{p.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{p.owner_name} · {p.mobile}</p>
                    <p className="text-xs text-muted-foreground">{[p.district, p.state, p.pincode].filter(Boolean).join(", ")}</p>
                    {p.submitted_at && <p className="text-xs text-muted-foreground mt-1">Submitted {new Date(p.submitted_at).toLocaleDateString()}</p>}
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => openDetail(p)}><Eye className="h-4 w-4 mr-1" /> View</Button>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={o => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Store className="h-5 w-5" /> {selected.center_name}</DialogTitle>
                <DialogDescription>Submitted {selected.submitted_at && new Date(selected.submitted_at).toLocaleString()}</DialogDescription>
              </DialogHeader>

              <div className="space-y-5">
                <Section title="Business">
                  <KV k="Owner" v={selected.owner_name} />
                  <KV k="Mobile" v={selected.mobile} />
                  <KV k="WhatsApp" v={selected.whatsapp} />
                  <KV k="Email" v={selected.email} />
                  <KV k="Address" v={[selected.address, selected.district, selected.state, selected.pincode].filter(Boolean).join(", ")} />
                </Section>

                <Section title="Identity">
                  <KV k="Aadhaar" v={selected.aadhaar_number && `XXXX-XXXX-${String(selected.aadhaar_number).slice(-4)}`} />
                  <KV k="PAN" v={selected.pan_number} />
                </Section>

                <Section title="Documents">
                  <div className="grid grid-cols-2 gap-3 col-span-2">
                    {(["aadhaar_front_url","aadhaar_back_url","pan_card_url","shop_photo_url"] as const).map(f => (
                      <div key={f} className="border rounded-lg p-2">
                        <p className="text-xs text-muted-foreground mb-1 capitalize">{f.replace(/_url$/, "").replace(/_/g, " ")}</p>
                        {signedUrls[f] ? (
                          <a href={signedUrls[f]} target="_blank" rel="noreferrer" className="block">
                            {/\.(png|jpe?g|gif|webp|avif)(\?|$)/i.test(signedUrls[f]) ? (
                              <img src={signedUrls[f]} alt={f} className="h-32 w-full object-cover rounded" />
                            ) : (
                              <span className="text-primary text-sm underline">Open file</span>
                            )}
                          </a>
                        ) : (
                          <p className="text-xs text-destructive">Missing</p>
                        )}
                      </div>
                    ))}
                  </div>
                </Section>

                <Section title="Business Details">
                  <KV k="Years in operation" v={selected.years_in_operation} />
                  <KV k="Monthly footfall" v={selected.monthly_footfall} />
                  <KV k="Services" v={(selected.services_offered || []).join(", ")} />
                  <KV k="Passport service" v={selected.offers_passport_service ? "Yes" : "No"} />
                  <KV k="Doc scanning" v={selected.offers_doc_scanning ? "Yes" : "No"} />
                  <KV k="Worker registration support" v={selected.offers_worker_registration ? "Yes" : "No"} />
                </Section>

                <Section title="Bank">
                  <KV k="Account holder" v={selected.account_holder} />
                  <KV k="Account no." v={selected.account_number && `••••${String(selected.account_number).slice(-4)}`} />
                  <KV k="IFSC" v={selected.ifsc} />
                  <KV k="UPI ID" v={selected.upi_id} />
                </Section>

                {selected.rejection_reason && (
                  <Card className="p-3 bg-destructive/5 border-destructive/30 text-sm">
                    <p className="font-medium text-destructive mb-1">Previous reason</p>
                    <p>{selected.rejection_reason}</p>
                  </Card>
                )}
              </div>

              <DialogFooter className="flex flex-wrap gap-2 pt-4 border-t mt-4">
                {(selected.status === "applied" || selected.status === "under_review") && (
                  <>
                    <Button variant="destructive" onClick={() => setActionDialog({ action: "reject", partner: selected })}>
                      <XCircle className="h-4 w-4 mr-1" /> Reject
                    </Button>
                    <Button onClick={() => setActionDialog({ action: "approve", partner: selected })}>
                      <CheckCircle className="h-4 w-4 mr-1" /> Approve
                    </Button>
                  </>
                )}
                {(selected.status === "approved" || selected.status === "active") && (
                  <Button variant="destructive" onClick={() => setActionDialog({ action: "suspend", partner: selected })}>
                    <ShieldOff className="h-4 w-4 mr-1" /> Suspend
                  </Button>
                )}
                {selected.status === "suspended" && (
                  <Button onClick={() => setActionDialog({ action: "reactivate", partner: selected })}>
                    <ShieldCheck className="h-4 w-4 mr-1" /> Reactivate
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Action confirmation */}
      <Dialog open={!!actionDialog} onOpenChange={o => { if (!o) { setActionDialog(null); setReason(""); } }}>
        <DialogContent>
          {actionDialog && (
            <>
              <DialogHeader>
                <DialogTitle className="capitalize">{actionDialog.action} partner</DialogTitle>
                <DialogDescription>
                  {actionDialog.action === "approve" && "Approving will give this partner full access to register workers."}
                  {actionDialog.action === "reject" && "Rejecting will block this partner from operational features. They will see your reason."}
                  {actionDialog.action === "suspend" && "Suspension immediately revokes operational access. The partner will see your reason."}
                  {actionDialog.action === "reactivate" && "Reactivation restores full partner access."}
                </DialogDescription>
              </DialogHeader>
              {(actionDialog.action === "reject" || actionDialog.action === "suspend") && (
                <div className="space-y-1.5 mt-2">
                  <label className="text-sm font-medium">Reason <span className="text-destructive">*</span></label>
                  <Textarea rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder="Explain why…" />
                </div>
              )}
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => { setActionDialog(null); setReason(""); }}>Cancel</Button>
                <Button onClick={submitAction} disabled={acting} variant={actionDialog.action === "reject" || actionDialog.action === "suspend" ? "destructive" : "default"}>
                  {acting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                  Confirm
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-sm font-semibold mb-2">{title}</h4>
      <div className="grid grid-cols-2 gap-2 text-sm">{children}</div>
    </div>
  );
}
function KV({ k, v }: { k: string; v: any }) {
  return (
    <div>
      <span className="text-muted-foreground">{k}:</span> <span>{v || "—"}</span>
    </div>
  );
}