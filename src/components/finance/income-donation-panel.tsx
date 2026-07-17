"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useIncome, useCreateIncome, useDonations, useCreateDonation } from "@/hooks/use-finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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

function NewIncomeDialog({ onDone }: { onDone: () => void }) {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [source, setSource] = useState("");
  const mutation = useCreateIncome();

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Record income</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Rental" />
          </div>
          <div className="space-y-1.5">
            <Label>Amount</Label>
            <Input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Description</Label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Source (optional)</Label>
            <Input value={source} onChange={(e) => setSource(e.target.value)} />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button
          loading={mutation.isPending}
          disabled={!category.trim() || !description.trim() || !amount}
          onClick={() =>
            mutation.mutate(
              { category, description, amount: Number(amount), date, source },
              { onSuccess: () => { onDone(); setCategory(""); setDescription(""); setAmount(""); setSource(""); } }
            )
          }
        >
          Record income
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function NewDonationDialog({ onDone }: { onDone: () => void }) {
  const [donorName, setDonorName] = useState("");
  const [donorContact, setDonorContact] = useState("");
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const mutation = useCreateDonation();

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Record donation</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Donor name</Label>
            <Input value={donorName} onChange={(e) => setDonorName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Amount</Label>
            <Input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Contact (optional)</Label>
          <Input value={donorContact} onChange={(e) => setDonorContact(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Purpose (optional)</Label>
          <Input value={purpose} onChange={(e) => setPurpose(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Date</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>
      <DialogFooter>
        <Button
          loading={mutation.isPending}
          disabled={!donorName.trim() || !amount}
          onClick={() =>
            mutation.mutate(
              { donorName, donorContact, amount: Number(amount), purpose, date },
              { onSuccess: () => { onDone(); setDonorName(""); setDonorContact(""); setAmount(""); setPurpose(""); } }
            )
          }
        >
          Record donation
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export function IncomeDonationPanel() {
  const { data: income = [], isLoading: loadingIncome } = useIncome();
  const { data: donations = [], isLoading: loadingDonations } = useDonations();
  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false);
  const [donationDialogOpen, setDonationDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Other income</CardTitle>
          <Dialog open={incomeDialogOpen} onOpenChange={setIncomeDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="size-4" /> Record income
              </Button>
            </DialogTrigger>
            <NewIncomeDialog onDone={() => setIncomeDialogOpen(false)} />
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Recorded by</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingIncome && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              )}
              {!loadingIncome && income.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    No income recorded yet.
                  </TableCell>
                </TableRow>
              )}
              {income.map((i) => (
                <TableRow key={i._id}>
                  <TableCell className="font-medium">{i.category}</TableCell>
                  <TableCell>{i.description}</TableCell>
                  <TableCell>₹{i.amount.toLocaleString("en-IN")}</TableCell>
                  <TableCell>{formatDate(i.date)}</TableCell>
                  <TableCell>{i.recordedBy.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Donations</CardTitle>
          <Dialog open={donationDialogOpen} onOpenChange={setDonationDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="size-4" /> Record donation
              </Button>
            </DialogTrigger>
            <NewDonationDialog onDone={() => setDonationDialogOpen(false)} />
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Donor</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Receipt No.</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingDonations && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              )}
              {!loadingDonations && donations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    No donations recorded yet.
                  </TableCell>
                </TableRow>
              )}
              {donations.map((d) => (
                <TableRow key={d._id}>
                  <TableCell className="font-medium">{d.donorName}</TableCell>
                  <TableCell>{d.purpose ?? "—"}</TableCell>
                  <TableCell>₹{d.amount.toLocaleString("en-IN")}</TableCell>
                  <TableCell className="font-mono text-xs">{d.receiptNumber}</TableCell>
                  <TableCell>{formatDate(d.date)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
