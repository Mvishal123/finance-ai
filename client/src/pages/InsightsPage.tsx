import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  income: z.number().min(0, "Income must be a positive number"),
  expenses: z.number().min(0, "Expenses must be a positive number"),
  savings: z.number().min(0, "Savings target must be a positive number"),
});

type FormValues = z.infer<typeof formSchema>;

export default function InsightsPage() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      income: 0,
      expenses: 0,
      savings: 0,
    },
  });

  function onSubmit(values: FormValues) {
    console.log(values);
    // TODO: Send data to backend for AI analysis
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Financial Data Input</CardTitle>
          <CardDescription>Enter your financial data for AI analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="income"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Income</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your monthly income"
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expenses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Expenses</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your monthly expenses"
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="savings"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Savings Target</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your savings target"
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit">Generate Insights</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>AI Insights</CardTitle>
          <CardDescription>Your personalized financial insights</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Enter your financial data above to receive AI-powered insights and recommendations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
