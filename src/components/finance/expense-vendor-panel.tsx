"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  useExpenses,
  useCreateExpense,
  useVendors,
  useCreateVendor,
  useVendorPayments,
  useCreateVendorPayment,
} from "@/hooks/use-finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import type { PaymentMethod } from "@/models/enums";

function NewVendorDialog({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const mutation = useCreateVendor();

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add vendor</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Stationery" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Email (optional)</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button
          loading={mutation.isPending}
          disabled={!name.trim() || !category.trim() || !phone.trim()}
          onClick={() =>
            mutation.mutate(
              { name, category, phone, email },
              { onSuccess: () => { onDone(); setName(""); setCategory(""); setPhone(""); setEmail(""); } }
            )
          }
        >
          Add vendor
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function NewExpenseDialog({ onDone }: { onDone: () => void }) {
  const { data: vendors = [] } = useVendors();
  const [category, setCategory] = useState("");
  const [vendor, setVendor] = useState<string>("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const mutation = useCreateExpense();

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Record expense</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Maintenance" />
          </div>
          <div className="space-y-1.5">
            <Label>Vendor (optional)</Label>
            <Select value={vendor} onValueChange={setVendor}>
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                {vendors.map((v) => (
                  <SelectItem key={v._id} value={v._id}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Description</Label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label>Amount</Label>
            <Input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Method</Label>
            <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
                <SelectItem value="bank_transfer">Bank transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button
          loading={mutation.isPending}
          disabled={!category.trim() || !description.trim() || !amount}
          onClick={() =>
            mutation.mutate(
              { category, vendor: vendor || undefined, description, amount: Number(amount), date, paymentMethod },
              { onSuccess: () => { onDone(); setCategory(""); setDescription(""); setAmount(""); setVendor(""); } }
            )
          }
        >
          Record expense
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function NewVendorPaymentDialog({ onDone }: { onDone: () => void }) {
  const { data: vendors = [] } = useVendors();
  const [vendor, setVendor] = useState("");
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank_transfer");
  const mutation = useCreateVendorPayment();

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Pay vendor</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Vendor</Label>
          <Select value={vendor} onValueChange={setVendor}>
            <SelectTrigger>
              <SelectValue placeholder="Select vendor" />
            </SelectTrigger>
            <SelectContent>
              {vendors.map((v) => (
                <SelectItem key={v._id} value={v._id}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Purpose</Label>
          <Input value={purpose} onChange={(e) => setPurpose(e.target.value)} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label>Amount</Label>
            <Input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Method</Label>
            <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
                <SelectItem value="bank_transfer">Bank transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button
          loading={mutation.isPending}
          disabled={!vendor || !purpose.trim() || !amount}
          onClick={() =>
            mutation.mutate(
              { vendor, amount: Number(amount), purpose, date, paymentMethod },
              { onSuccess: () => { onDone(); setVendor(""); setPurpose(""); setAmount(""); } }
            )
          }
        >
          Pay vendor
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export function ExpenseVendorPanel() {
  const { data: vendors = [], isLoading: loadingVendors } = useVendors();
  const { data: expenses = [], isLoading: loadingExpenses } = useExpenses();
  const { data: vendorPayments = [], isLoading: loadingPayments } = useVendorPayments();

  const [vendorDialogOpen, setVendorDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Vendors</CardTitle>
          <Dialog open={vendorDialogOpen} onOpenChange={setVendorDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="size-4" /> Add vendor
              </Button>
            </DialogTrigger>
            <NewVendorDialog onDone={() => setVendorDialogOpen(false)} />
          </Dialog>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {loadingVendors && <Skeleton className="h-8 w-full" />}
          {!loadingVendors && vendors.length === 0 && (
            <p className="text-sm text-muted-foreground">No vendors added yet.</p>
          )}
          {vendors.map((v) => (
            <Badge key={v._id} variant="secondary">
              {v.name} · {v.category}
            </Badge>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Expenses</CardTitle>
          <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="size-4" /> Record expense
              </Button>
            </DialogTrigger>
            <NewExpenseDialog onDone={() => setExpenseDialogOpen(false)} />
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingExpenses && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              )}
              {!loadingExpenses && expenses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    No expenses recorded yet.
                  </TableCell>
                </TableRow>
              )}
              {expenses.map((e) => (
                <TableRow key={e._id}>
                  <TableCell className="font-medium">{e.category}</TableCell>
                  <TableCell>{e.description}</TableCell>
                  <TableCell>{e.vendor?.name ?? "—"}</TableCell>
                  <TableCell>₹{e.amount.toLocaleString("en-IN")}</TableCell>
                  <TableCell>{formatDate(e.date)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Vendor payments</CardTitle>
          <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="size-4" /> Pay vendor
              </Button>
            </DialogTrigger>
            <NewVendorPaymentDialog onDone={() => setPaymentDialogOpen(false)} />
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingPayments && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              )}
              {!loadingPayments && vendorPayments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    No vendor payments recorded yet.
                  </TableCell>
                </TableRow>
              )}
              {vendorPayments.map((p) => (
                <TableRow key={p._id}>
                  <TableCell className="font-medium">{p.vendor.name}</TableCell>
                  <TableCell>{p.purpose}</TableCell>
                  <TableCell>₹{p.amount.toLocaleString("en-IN")}</TableCell>
                  <TableCell>{formatDate(p.date)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
