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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { getPhoneNumberInfo } from "@/app/signup/employer/page";

export function Step2ContactPrefs() {
  const { control, watch } = useFormContext();
  const [showPassword, setShowPassword] = useState(false);
  const [phoneCodeMode, setPhoneCodeMode] = useState<"select" | "custom">("select");
  const [customPhoneCode, setCustomPhoneCode] = useState("");

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
                <Input {...field} />
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
              <FormItem className="w-[120px]">
                {phoneCodeMode === "select" ? (
                  <Select 
                    onValueChange={(value) => {
                      if (value === "custom") {
                        setPhoneCodeMode("custom");
                        field.onChange("");
                      } else {
                        field.onChange(value);
                      }
                    }} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="+20" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="+1">🇺🇸 +1</SelectItem>
                      <SelectItem value="+7">🇷🇺 +7</SelectItem>
                      <SelectItem value="+20">🇪🇬 +20</SelectItem>
                      <SelectItem value="+27">🇿🇦 +27</SelectItem>
                      <SelectItem value="+30">🇬🇷 +30</SelectItem>
                      <SelectItem value="+31">🇳🇱 +31</SelectItem>
                      <SelectItem value="+32">🇧🇪 +32</SelectItem>
                      <SelectItem value="+33">🇫🇷 +33</SelectItem>
                      <SelectItem value="+34">🇪🇸 +34</SelectItem>
                      <SelectItem value="+39">🇮🇹 +39</SelectItem>
                      <SelectItem value="+41">🇨🇭 +41</SelectItem>
                      <SelectItem value="+44">🇬🇧 +44</SelectItem>
                      <SelectItem value="+45">🇩🇰 +45</SelectItem>
                      <SelectItem value="+46">🇸🇪 +46</SelectItem>
                      <SelectItem value="+47">🇳🇴 +47</SelectItem>
                      <SelectItem value="+48">🇵🇱 +48</SelectItem>
                      <SelectItem value="+49">🇩🇪 +49</SelectItem>
                      <SelectItem value="+51">🇵🇪 +51</SelectItem>
                      <SelectItem value="+52">🇲🇽 +52</SelectItem>
                      <SelectItem value="+55">🇧🇷 +55</SelectItem>
                      <SelectItem value="+60">🇲🇾 +60</SelectItem>
                      <SelectItem value="+61">🇦🇺 +61</SelectItem>
                      <SelectItem value="+62">🇮🇩 +62</SelectItem>
                      <SelectItem value="+63">🇵🇭 +63</SelectItem>
                      <SelectItem value="+64">🇳🇿 +64</SelectItem>
                      <SelectItem value="+65">🇸🇬 +65</SelectItem>
                      <SelectItem value="+66">🇹🇭 +66</SelectItem>
                      <SelectItem value="+81">🇯🇵 +81</SelectItem>
                      <SelectItem value="+82">🇰🇷 +82</SelectItem>
                      <SelectItem value="+84">🇻🇳 +84</SelectItem>
                      <SelectItem value="+86">🇨🇳 +86</SelectItem>
                      <SelectItem value="+90">🇹🇷 +90</SelectItem>
                      <SelectItem value="+91">🇮🇳 +91</SelectItem>
                      <SelectItem value="+92">🇵🇰 +92</SelectItem>
                      <SelectItem value="+94">🇱🇰 +94</SelectItem>
                      <SelectItem value="+95">🇲🇲 +95</SelectItem>
                      <SelectItem value="+98">🇮🇷 +98</SelectItem>
                      <SelectItem value="+212">🇲🇦 +212</SelectItem>
                      <SelectItem value="+213">🇩🇿 +213</SelectItem>
                      <SelectItem value="+216">🇹🇳 +216</SelectItem>
                      <SelectItem value="+218">🇱🇾 +218</SelectItem>
                      <SelectItem value="+220">🇬🇲 +220</SelectItem>
                      <SelectItem value="+234">🇳🇬 +234</SelectItem>
                      <SelectItem value="+249">🇸🇩 +249</SelectItem>
                      <SelectItem value="+251">🇪🇹 +251</SelectItem>
                      <SelectItem value="+254">🇰🇪 +254</SelectItem>
                      <SelectItem value="+255">🇹🇿 +255</SelectItem>
                      <SelectItem value="+256">🇺🇬 +256</SelectItem>
                      <SelectItem value="+880">🇧🇩 +880</SelectItem>
                      <SelectItem value="+960">🇲🇻 +960</SelectItem>
                      <SelectItem value="+961">🇱🇧 +961</SelectItem>
                      <SelectItem value="+962">🇯🇴 +962</SelectItem>
                      <SelectItem value="+963">🇸🇾 +963</SelectItem>
                      <SelectItem value="+964">🇮🇶 +964</SelectItem>
                      <SelectItem value="+965">🇰🇼 +965</SelectItem>
                      <SelectItem value="+966">🇸🇦 +966</SelectItem>
                      <SelectItem value="+967">🇾🇪 +967</SelectItem>
                      <SelectItem value="+968">🇴🇲 +968</SelectItem>
                      <SelectItem value="+970">🇵🇸 +970</SelectItem>
                      <SelectItem value="+971">🇦🇪 +971</SelectItem>
                      <SelectItem value="+972">🇮🇱 +972</SelectItem>
                      <SelectItem value="+973">🇧🇭 +973</SelectItem>
                      <SelectItem value="+974">🇶🇦 +974</SelectItem>
                      <SelectItem value="custom">✏️ Custom</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="space-y-1">
                    <FormControl>
                      <Input 
                        placeholder="+123" 
                        value={customPhoneCode}
                        onChange={(e) => {
                          let value = e.target.value;
                          // Ensure it starts with +
                          if (!value.startsWith('+')) {
                            value = '+' + value.replace(/[^\d]/g, '');
                          } else {
                            value = '+' + value.slice(1).replace(/[^\d]/g, '');
                          }
                          setCustomPhoneCode(value);
                          field.onChange(value);
                        }}
                        maxLength={5}
                      />
                    </FormControl>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      className="h-6 text-xs p-1"
                      onClick={() => {
                        setPhoneCodeMode("select");
                        setCustomPhoneCode("");
                        field.onChange("+20");
                      }}
                    >
                      ← Select
                    </Button>
                  </div>
                )}
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
