'use client'

import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useContextEmi } from "../emiContext";
import { Input } from "@/components/ui/input";

export default function BuyerPersonalInfo({ cardinfofield, errors }) {
  const { AvailablebankProvider } = useContextEmi();

  return (
    <div className="bg-gradient-to-b from-white to-blue-50 py-4 sm:py-6 px-2">
      <div className="">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {cardinfofield.fields.map((field, fieldIndex) => (
            <div key={fieldIndex} className={`space-y-1.5 ${field.extenduserinfo || ''}`}>
              <Label className="block text-sm font-medium text-gray-700">
                {field.label}
              </Label>
              <div className="relative">
                {field.type === "select" ? (
                  <Select
                    value={field.value}
                    onValueChange={(value) => field.onChange({ target: { name: field.name, value } })}
                  >
                    <SelectTrigger className={`w-full h-10 pl-10 bg-white border-blue-200 text-gray-600 text-sm rounded-lg focus:border-transparent focus:ring-1 focus:ring-[var(--colour-fsP2)] transition-all duration-150 ${errors[field.name] ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder={`Select ${field.label}`} className="text-yellow-400" />
                      <Image
                        src={field.svgicon}
                        alt={field.label}
                        height={16}
                        width={16}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-600"
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-blue-100 rounded-lg shadow-lg max-h-60 overflow-y-auto z-[1000] text-sm">
                      {field.options ? (
                        field.options.map((option) => (
                          <SelectItem
                            key={option}
                            value={option}
                            className="cursor-pointer px-4 py-2 hover:bg-yellow-50 hover:text-blue-600 focus:bg-gray-100 focus:text-blue-600 transition-all duration-150"
                          >
                            {option}
                          </SelectItem>
                        ))
                      ) : (
                        AvailablebankProvider.map((bank) => (
                          <SelectItem
                            key={bank.id}
                            value={bank.name}
                            className="cursor-pointer px-4 py-2 hover:bg-yellow-50 hover:text-blue-600 focus:bg-gray-100 focus:text-blue-600 transition-all duration-150"
                          >
                            {bank.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="relative">
                    <Input
                      type={field.type || "text"}
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={field.placeholder}
                      maxLength={field.maxLength}
                      max={field.maxvalue}
                      disabled={field.disabled}
                      className={`w-full h-10 pl-10 bg-white border-blue-200 text-gray-600 text-sm rounded-lg focus:border-transparent focus:ring-1 focus:ring-[var(--colour-fsP2)] transition-all duration-150 ${errors[field.name] ? 'border-red-500' : ''}`}
                    />
                    <Image
                      src={field.svgicon}
                      alt={field.label}
                      height={16}
                      width={16}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-600"
                    />
                  </div>
                )}
                {errors[field.name] && (
                  <p className="text-red-500 text-xs mt-1">{errors[field.name]}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}