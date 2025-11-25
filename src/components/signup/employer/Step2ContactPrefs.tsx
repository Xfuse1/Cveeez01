"use client";

import { useState } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { jobTitleOptions } from "@/data/job-titles";
import { getPhoneNumberInfo, phoneCodeOptions } from "@/data/phone-codes";

export function Step2ContactPrefs() {
  const { control, watch } = useFormContext();
  const [showPassword, setShowPassword] = useState(false);

  const { fields: phoneFields, append: appendPhone } = useFieldArray({
    control,
    name: "additionalPhones",
  });

  const { fields: emailFields, append: appendEmail } = useFieldArray({
    control,
    name: "additionalEmails",
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="contactPersonName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Person’s Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="contactPersonJobTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Person’s Job Title</FormLabel>
              <FormControl>
                <SearchableSelect
                  value={field.value}
                  onChange={field.onChange}
                  options={jobTitleOptions.map((title) => ({ value: title, label: title }))}
                  placeholder="Select or type a title"
                  searchPlaceholder="Type to search job titles"
                  allowCustomValue
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email (for login)</FormLabel>
            <FormControl>
              <Input type="email" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} {...field} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Phone Number with Country Code */}
      <div className="grid gap-2">
        <Label>Primary Phone Number</Label>
        <div className="flex gap-2">
          <FormField
            control={control}
            name="phoneCode"
            render={({ field }) => (
              <FormItem className="w-[220px]">
                <FormControl>
                  <SearchableSelect
                    value={field.value}
                    onChange={(val) => {
                      const cleaned = val.startsWith("+")
                        ? "+" + val.slice(1).replace(/[^\d]/g, "")
                        : "+" + val.replace(/[^\d]/g, "");
                      field.onChange(cleaned.slice(0, 5));
                    }}
                    options={phoneCodeOptions}
                    placeholder="+20"
                    searchPlaceholder="Search country or code"
                    emptyText="No matching country code"
                    allowCustomValue
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="phoneNumber"
            render={({ field }) => {
              const currentPhoneCode = watch("phoneCode") || "+20";
              const phoneInfo = getPhoneNumberInfo(currentPhoneCode);
              return (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input 
                      type="tel" 
                      placeholder={phoneInfo.placeholder}
                      {...field}
                      onChange={(e) => {
                        // Only allow digits
                        const value = e.target.value.replace(/[^\d]/g, '');
                        field.onChange(value);
                      }}
                      maxLength={phoneInfo.max}
                    />
                  </FormControl>
                  <div className="text-xs text-muted-foreground mt-1">
                    Expected: {phoneInfo.lengthText}
                  </div>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>
      </div>
      
      <div>
        <FormLabel>Additional Company Phones</FormLabel>
        {phoneFields.map((field, index) => (
          <FormField
            key={field.id}
            control={control}
            name={`additionalPhones.${index}.value`}
            render={({ field }) => (
              <FormItem className="mt-2">
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <Button type="button" variant="link" onClick={() => appendPhone({ value: "" })}>
          + Add Phone Number
        </Button>
      </div>
      <div>
        <FormLabel>Additional Company Emails</FormLabel>
        {emailFields.map((field, index) => (
          <FormField
            key={field.id}
            control={control}
            name={`additionalEmails.${index}.value`}
            render={({ field }) => (
              <FormItem className="mt-2">
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <Button type="button" variant="link" onClick={() => appendEmail({ value: "" })}>
          + Add Email
        </Button>
      </div>
    </div>
  );
}
