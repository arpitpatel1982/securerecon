import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { scanRequestSchema, type ScanRequest } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Search, Shield } from "lucide-react";

interface ScanInputFormProps {
  onScan: (data: ScanRequest) => void;
  isScanning: boolean;
}

export function ScanInputForm({ onScan, isScanning }: ScanInputFormProps) {
  const form = useForm<ScanRequest>({
    resolver: zodResolver(scanRequestSchema),
    defaultValues: {
      url: "",
    },
  });

  const onSubmit = (data: ScanRequest) => {
    onScan(data);
  };

  const exampleUrls = [
    "https://example.com",
    "https://github.com",
    "https://stackoverflow.com",
  ];

  return (
    <Card className="border-card-border" data-testid="card-scan-input">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-primary/10">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Security Reconnaissance</CardTitle>
            <CardDescription className="mt-1">
              Enter a URL to perform comprehensive security analysis
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          {...field}
                          placeholder="https://example.com"
                          className="pl-10 font-mono text-base"
                          disabled={isScanning}
                          data-testid="input-url"
                        />
                      </div>
                      <Button 
                        type="submit" 
                        disabled={isScanning}
                        size="default"
                        data-testid="button-scan"
                      >
                        {isScanning ? "Scanning..." : "Scan Now"}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Quick start:</span>
              {exampleUrls.map((url) => (
                <Button
                  key={url}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => form.setValue("url", url)}
                  disabled={isScanning}
                  className="text-xs font-mono"
                  data-testid={`button-example-${url}`}
                >
                  {url}
                </Button>
              ))}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
