'use client'

import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { BANK_PROVIDERS } from "../../_components/_func_emiCalacutor";

export default function CreditCardComponent({ cardinfofield, errors }: any) {

  // Extract expiryDate and cardLimit fields
  const expiryField = cardinfofield.fields.find((field) => field.name === 'expiryDate');
  const limitField = cardinfofield.fields.find((field) => field.name === 'cardLimit');

  return (
    <div className="bg-gradient-to-b from-white to-blue-50 flex items-center justify-center ">
      <div className="">
        <div className="flex flex-col sm:flex-row gap-4 p-1 sm:p-2">


          {/* Input Section */}
          <div className="w-full  space-y-4">
            {/* Loop through fields, excluding expiryDate and cardLimit */}
            {cardinfofield.fields
              .filter((field) => field.name !== 'expiryDate' && field.name !== 'cardLimit')
              .map((field, fieldIndex) => (
                <div key={fieldIndex}>
                  <Label className="block text-sm font-medium text-gray-700 mb-1.5">{field.label}</Label>
                  <div className="relative">
                    {field.type === 'select' ? (
                      <Select
                        value={field.value}
                        onValueChange={(value) => field.onChange({ target: { value } })}
                      >
                        <SelectTrigger
                          className={`w-full h-10 pl-10 bg-white border-blue-200 text-gray-600 text-sm rounded-lg focus:border-(--colour-fsP2) focus:ring-1 focus:ring-(--colour-fsP2) transition-all duration-150 ${errors[field.name] ? 'border-red-500' : ''
                            }`}
                        >
                          <SelectValue placeholder={`Select ${field.label}`} />
                          <div className={`absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center transition-colors z-10 pointer-events-none ${errors[field.name] ? 'text-red-500' : 'text-gray-400 group-focus-within:text-(--colour-fsP2)'}`}>
                            {field.svgicon}
                          </div>
                        </SelectTrigger>
                        <SelectContent className="bg-white border-blue-100 rounded-lg shadow-lg max-h-60 overflow-y-auto z-[1000] text-sm">
                          {field.options ? (
                            field.options.map((option) => (
                              <SelectItem
                                key={option}
                                value={option}
                                className="cursor-pointer px-4 py-2 hover:bg-blue-50 hover:text-(--colour-fsP2) focus:text-(--colour-fsP2) transition-all duration-150"
                              >
                                {option}
                              </SelectItem>
                            ))
                          ) : (
                            BANK_PROVIDERS.map((bank) => (
                              <SelectItem
                                key={bank.id}
                                value={bank.name}
                                className="cursor-pointer px-4 py-2 hover:bg-blue-50 hover:text-(--colour-fsP2) focus:text-(--colour-fsP2) transition-all duration-150"
                              >
                                {bank.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="relative group">
                        <Input
                          type={field.type || 'text'}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder={field.placeholder}
                          maxLength={field.maxLength}
                          max={field.maxvalue}
                          autoComplete="off"
                          className={`w-full h-10 pl-10 bg-white border-blue-200 text-gray-600 text-sm rounded-lg focus:border-transparent focus:ring-1 focus:ring-(--colour-fsP2) transition-all duration-150 ${errors[field.name] ? 'border-red-500' : ''
                            }`}
                        />
                        <div className={`absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center transition-colors z-10 pointer-events-none ${errors[field.name] ? 'text-red-500' : 'text-gray-400 group-focus-within:text-(--colour-fsP2)'}`}>
                          {field.svgicon}
                        </div>
                      </div>
                    )}
                    {errors[field.name] && <p className="text-red-500 text-xs mt-1">{errors[field.name]}</p>}
                  </div>
                </div>
              ))}

            {/* Grid for expiryDate and cardLimit */}
            {(expiryField || limitField) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {expiryField && (
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-1.5">{expiryField.label}</Label>
                    <div className="relative group">
                      <Input
                        type={expiryField.type || 'text'}
                        value={expiryField.value}
                        onChange={expiryField.onChange}
                        placeholder={expiryField.placeholder}
                        maxLength={expiryField.maxLength}
                        autoComplete="off"
                        className={`w-full h-10 pl-10 bg-white border-blue-200 text-gray-600 text-sm rounded-lg focus:border-transparent focus:ring-1 focus:ring-(--colour-fsP2) transition-all duration-150 ${errors[expiryField.name] ? 'border-red-500' : ''
                          }`}
                      />
                      <div className={`absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center transition-colors z-10 pointer-events-none ${errors[expiryField.name] ? 'text-red-500' : 'text-gray-400 group-focus-within:text-(--colour-fsP2)'}`}>
                        {expiryField.svgicon}
                      </div>
                      {errors[expiryField.name] && (
                        <p className="text-red-500 text-xs mt-1">{errors[expiryField.name]}</p>
                      )}
                    </div>
                  </div>
                )}
                {limitField && (
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-1.5">{limitField.label}</Label>
                    <div className="relative group">
                      <Input
                        type={limitField.type || 'text'}
                        value={limitField.value}
                        onChange={limitField.onChange}
                        placeholder={limitField.placeholder}
                        maxLength={limitField.maxLength}
                        autoComplete="off"
                        className={`w-full h-10 pl-10 bg-white border-blue-200 text-gray-600 text-sm rounded-lg focus:border-transparent focus:ring-1 focus:ring-(--colour-fsP2) transition-all duration-150 ${errors[limitField.name] ? 'border-red-500' : ''
                          }`}
                      />
                      <div className={`absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center transition-colors z-10 pointer-events-none ${errors[limitField.name] ? 'text-red-500' : 'text-gray-400 group-focus-within:text-(--colour-fsP2)'}`}>
                        {limitField.svgicon}
                      </div>
                      {errors[limitField.name] && (
                        <p className="text-red-500 text-xs mt-1">{errors[limitField.name]}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}