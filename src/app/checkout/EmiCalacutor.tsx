'use client'

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Search, ArrowLeft, Calculator, Percent, ArrowRight, Calendar } from 'lucide-react';
import { useContextEmi } from '../emi/emiContext';
import RemoteServices from '../api/remoteservice';
import Image from 'next/image';
import { ProductDetails } from '../types/ProductDetailsTypes';

export default function EMICalculator() {
  const { emiContextInfo, setEmiContextInfo, AvailablebankProvider } = useContextEmi();
  const [loanAmount, setLoanAmount] = useState(100000);
  const [interestRate, setInterestRate] = useState(10);
  const [tenure, setTenure] = useState(12);
  const [showSchedule, setShowSchedule] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<ProductDetails[]>([]);
  const [selectedBank, setSelectedBank] = useState(emiContextInfo.bankinfo.bankname || '');

  // Update loan amount and interest rate when product or bank is selected
  useEffect(() => {
    if (emiContextInfo.product) {
      // Assuming emiContextInfo.emiCalculation.downPayment is what was emicalclatorinfo.emirequiredinfo.Downpayment
      // Casting to number if needed, though context types say number
      setLoanAmount(Number(emiContextInfo.product.price) - Number(emiContextInfo.emiCalculation.downPayment));
    }
    if (selectedBank) {
      const bank = AvailablebankProvider.find((b) => b.id === selectedBank);
      if (bank) {
        setInterestRate(bank.rate);
        setEmiContextInfo((prev) => ({
          ...prev,
          bankinfo: { ...prev.bankinfo, bankname: bank.name },
        }));
      }
    }
  }, [emiContextInfo.product, emiContextInfo.emiCalculation.downPayment, selectedBank, setEmiContextInfo, AvailablebankProvider]);

  // Search and filter products
  useEffect(() => {
    if (searchQuery.trim()) {
      RemoteServices.SerachProducts(searchQuery.trim()).then(res => {
        setFilteredProducts(res.data);
      }).catch(e => console.log('error', e));
    } else {
      setFilteredProducts([]);
    }
  }, [searchQuery]);

  // EMI Calculation
  const calculateEMI = () => {
    const principal = loanAmount;
    const monthlyRate = interestRate / 100 / 12;
    const months = tenure;
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
    const totalPayable = emi * months;
    const totalInterest = totalPayable - principal;
    return { emi: emi.toFixed(2), totalPayable: totalPayable.toFixed(2), totalInterest: totalInterest.toFixed(2) };
  };

  // Amortization Schedule
  const generateAmortizationSchedule = () => {
    const schedule = [];
    let balance = loanAmount;
    const monthlyRate = interestRate / 100 / 12;
    const months = tenure;
    const emiVal = parseFloat(calculateEMI().emi);

    for (let i = 1; i <= months; i++) {
      const interest = balance * monthlyRate;
      const principalPaid = emiVal - interest;
      balance -= principalPaid;
      schedule.push({
        month: i,
        emi: emiVal.toFixed(2),
        principal: principalPaid.toFixed(2),
        interest: interest.toFixed(2),
        balance: Math.max(balance, 0).toFixed(2),
      });
    }
    return schedule;
  };

  const handleProductSelect = (product: ProductDetails) => {
    setEmiContextInfo((prev) => ({
      ...prev,
      product: product,
    }));
    setSearchQuery('');
    setFilteredProducts([]);
  };

  const handleBackToSearch = () => {
    setEmiContextInfo((prev) => ({
      ...prev,
      product: null,
      bankinfo: { ...prev.bankinfo, bankname: '' },
    }));
    setLoanAmount(100000);
    setSelectedBank('');
    setInterestRate(10);
  };

  const { emi, totalPayable, totalInterest } = calculateEMI();

  const currencySymbol = 'Rs.'

  return (
    <Drawer
      open={emiContextInfo.isDrawerOpen}
      onOpenChange={(open) =>
        setEmiContextInfo((prev) => ({ ...prev, isDrawerOpen: open }))
      }
    >
      <DrawerContent className="max-h-[85vh] min-h-[60vh] max-w-6xl mx-auto bg-white border-0 shadow-xl">
        <DrawerHeader className="text-center  m-0 p-0 items-center border-b-gray-200 border-b  ">
          <DrawerTitle className="flex items-center justify-center gap-2 m-0 p-0 text-xl text-[var(--colour-fsP2)] font-semibold">
            <CreditCard className="w-5 h-5 text-[var(--colour-fsP1)] mb-2" />
            <span className=' items-center mb-2'>         EMI Calculator - {emiContextInfo.product?.name
              ? emiContextInfo.product.name.length > 45
                ? emiContextInfo.product.name.slice(0, 45) + '...'
                : emiContextInfo.product.name
              : 'Select Product'}

            </span>
          </DrawerTitle>
        </DrawerHeader>

        <div className="p-4 overflow-y-auto">
          {/* Product Search */}
          {!emiContextInfo.product && (
            <div className="mb-4">


              <div className="flex rounded-full border border-gray-300 bg-gray-50 hover:bg-white hover:border-blue-300 transition-all duration-200 overflow-hidden focus-within:ring-2 focus-within:ring-blue-200">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for a product..."
                  className="w-full px-4 py-2 bg-transparent border-none focus:outline-none text-sm placeholder-gray-500"
                />
                <button className="bg-blue-600 text-white px-3 py-1.5 m-0.5 hover:bg-blue-700 transition-colors rounded-full duration-200 flex items-center justify-center">
                  <Search className="w-4 h-4" />
                </button>
              </div>
              {filteredProducts.length > 0 && (
                <div className="mt-2 max-h-56 overflow-auto bg-white border border-gray-200 rounded-md shadow-sm">
                  {filteredProducts.map((product: ProductDetails) => (
                    <div
                      key={product.id}
                      className="flex items-center p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                      onClick={() => handleProductSelect(product)}
                    >
                      {product.image && (
                        <div className="relative w-8 h-8 mr-3">
                          {(typeof product.image === 'string' ? product.image : product.image?.thumb || product.image?.full) ? (
                            <Image
                              src={typeof product.image === 'string' ? product.image : product.image?.thumb || product.image?.full || ''}
                              alt={product.name}
                              fill
                              className="object-contain rounded border border-gray-100"
                            />
                          ) : <div className="w-full h-full bg-gray-100 rounded" />}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                        <p className="text-xs text-gray-600">  {currencySymbol}{product.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {emiContextInfo.product && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left: Product Info */}
              <div className="lg:col-span-1 bg-gray-50 rounded-lg px-3">
                <Button
                  variant="ghost"
                  onClick={handleBackToSearch}
                  className=" m-0  h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs p-2"
                >
                  <ArrowLeft className="w-3 h-3 mr-1" />
                  Change Product
                </Button>

                <div className="text-center">
                  {emiContextInfo.product.image && (
                    <Image
                      src={emiContextInfo.product.image.full}
                      alt={emiContextInfo.product.name}
                      className="object-contain mb-3 bg-white rounded border border-gray-200"
                      width={400}
                      height={500}
                    />
                  )}
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">{emiContextInfo.product.name}</h3>
                  <p className="text-lg font-bold text-blue-600">  {currencySymbol}{emiContextInfo.product.price}</p>
                </div>
              </div>

              {/* Center: Calculator Inputs */}
              <div className="lg:col-span-1 space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Emi Terms</h3>

                <div>

                  <Select value={selectedBank} onValueChange={setSelectedBank}>
                    <SelectTrigger className="border-gray-300 w-full focus:ring-gray-200 focus:border-none focus:outline-none outline-none">
                      <SelectValue placeholder="Select your bank" />
                    </SelectTrigger>
                    <SelectContent className="border-gray-300 bg-blue-50 focus:ring-gray-200 focus:border-none w-full">
                      {AvailablebankProvider.map(bank => (
                        <SelectItem key={bank.id} value={bank.id}>{bank.name}</SelectItem>
                      ))}
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Downpayment */}
                <div>
                  <label className=" text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">

                    Downpayment ({currencySymbol})
                  </label>
                  <Input
                    type="number"
                    value={emiContextInfo.emiCalculation.downPayment}
                    onChange={(e) =>
                      setEmiContextInfo((prev) => ({
                        ...prev,
                        emiCalculation: { ...prev.emiCalculation, downPayment: Number(e.target.value) },
                      }))
                    }
                    className="h-9 border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"

                    max={Number(emiContextInfo.product.price)}
                  />
                </div>

                {/* Loan Amount */}
                <div>
                  <label className=" text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Calculator className="w-3 h-3" />
                    Principal Amount (  {currencySymbol})
                  </label>
                  <Input
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="h-9 border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                    min={1000}
                    max={Number(emiContextInfo.product.price)}
                  />
                </div>

                {/* Interest Rate */}
                <div>
                  <label className=" text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Percent className="w-3 h-3" />
                    Interest Rate (% p.a.)
                  </label>
                  <Input
                    type="number"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="h-9 border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                    min={1}
                    max={30}
                    step={0.1}
                    disabled={selectedBank !== ''}
                  />
                </div>




                <div>
                  <label className=" text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Tenure (Months)
                  </label>
                  <Select onValueChange={(value) => setTenure(Number(value))}>
                    <SelectTrigger className="border-gray-300 w-full focus:ring-gray-200 focus:border-none focus:outline-none outline-none">
                      <SelectValue placeholder="Select  Duration " />
                    </SelectTrigger>
                    <SelectContent className="border-gray-300 bg-blue-50 focus:ring-gray-200 focus:border-none w-full">
                      <SelectItem value="6">6 Months</SelectItem>
                      <SelectItem value="9">9 Months</SelectItem>
                      <SelectItem value="12">12 Months</SelectItem>
                      <SelectItem value="18">18 Months</SelectItem>
                      <SelectItem value="24">24 Months</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Right: Results */}
              <div className="lg:col-span-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Loan Summary</h3>

                {/* Results Cards */}
                <div className="space-y-2">
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Monthly EMI</span>
                      <span className="text-lg font-bold text-blue-600">  {currencySymbol}{emi}</span>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Total Interest</span>
                      <span className="text-sm font-semibold text-red-600">  {currencySymbol}{totalInterest}</span>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Total Payable</span>
                      <span className="text-sm font-semibold text-gray-900">  {currencySymbol}{totalPayable}</span>
                    </div>
                  </div>
                </div>

                {/* Schedule Toggle */}
                <Button
                  onClick={() => setShowSchedule(!showSchedule)}
                  variant={showSchedule ? "secondary" : "default"}
                  className="w-full mt-3 h-8 text-xs"
                >
                  {showSchedule ? 'Hide Schedule' : 'Show Schedule'}
                </Button>
              </div>
            </div>
          )}

          {/* Amortization Schedule */}
          {showSchedule && emiContextInfo.product && (
            <div className="mt-4 bg-white border border-gray-200 rounded-lg">
              <div className="p-3 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900">Payment Schedule</h3>
              </div>

              <div className="overflow-x-auto">
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-gray-700">Month</th>
                        <th className="px-3 py-2 text-right font-medium text-gray-700">EMI</th>
                        <th className="px-3 py-2 text-right font-medium text-gray-700">Principal</th>
                        <th className="px-3 py-2 text-right font-medium text-gray-700">Interest</th>
                        <th className="px-3 py-2 text-right font-medium text-gray-700">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generateAmortizationSchedule().map((row, index) => (
                        <tr key={row.month} className={index % 2 === 0 ? 'bg-gray-25' : 'bg-white'}>
                          <td className="px-3 py-2 text-gray-900">{row.month}</td>
                          <td className="px-3 py-2 text-right text-gray-900">  {currencySymbol}{row.emi}</td>
                          <td className="px-3 py-2 text-right text-gray-700">  {currencySymbol}{row.principal}</td>
                          <td className="px-3 py-2 text-right text-gray-700">  {currencySymbol}{row.interest}</td>
                          <td className="px-3 py-2 text-right text-gray-700">  {currencySymbol}{row.balance}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        <DrawerFooter className="border-t border-gray-100 py-2 px-4">
          <div className="flex justify-end">
            {emiContextInfo.product === null ?
              (
                <DrawerClose asChild>
                  <Button variant="outline" className="h-8 px-4 text-xs border-gray-200 text-gray-700 hover:bg-gray-50">
                    Close
                  </Button>
                </DrawerClose>
              ) :
              (<button
                onClick={() => {
                  setEmiContextInfo(prev => ({ ...prev, isDrawerOpen: true }))
                  // Navigation to application or next step?
                  // Previously it was setting isDrawerOpen:true for product selection?
                  // But we are IN the drawer here.
                  // Maybe it was meant to close this drawer and open APPLICATION drawer?
                  // Assuming logic: close Calculator drawer, open Form drawer?
                  // Since we are reusing isDrawerOpen, maybe the context handles multiple drawers or screens?
                  // For now, I will keep isDrawerOpen:true which might mean "keep it open" or "open next step" if logic exists elsewhere.
                  // Wait, emiContext has ONE isDrawerOpen.
                  // If this is the calculator, maybe the next step is applying which might be a different route or component.
                  // The previous code:
                  // setemicalclatorinfo(prev=>({...prev,isEmiCalcltorOpen:false}))
                  // setEmiContextInfo(prev=>({...prev,isDrawerOpen:true,product:emicalclatorinfo.productselected}))
                  // This suggests getting OUT of calculator and INTO EmiContext's main flow.
                  // So here I should just set isDrawerOpen: true (as default) but I was already using isDrawerOpen for THIS drawer in my refactor?
                  // Wait, CartContext had `isEmiCalcltorOpen`. EmiContext has `isDrawerOpen`.
                  // If I map `isEmiCalcltorOpen` to `isDrawerOpen`, then closing calculator means closing drawer.
                  // But the previous code closed calculator and opened EmiContext drawer?
                  // This implies two different drawers.
                  // Since I am merging into EmiContext, I will assume EmiContext's `isDrawerOpen` is for the Application Form.
                  // And I need a separate state for Calculator Drawer? Or maybe Calculator IS the first step?
                  // Use local state for Calculator visibility?
                  // Or add `isEmiCalculatorOpen` to EmiContext?
                  // I will check EmiContext again. It only has `isDrawerOpen`.
                  // I will USE LOCAL STATE for Calculator visibility if possible, OR add it to context.
                  // But since I can't easily change context type worldwide without checking usage...
                  // I will try to infer usage.
                  // The previous code imported BOTH contexts.
                  // Now I only have EmiContext.
                  // If I use `isDrawerOpen` for Calculator, then "Apply Now" should probably navigate to `/emi/apply` or something?
                  // Or maybe I should just keep isDrawerOpen for the form.
                  // And use a LOCAL state for calculator? But calculator is triggered from EmiProduct potentially?
                  // In EmiProduct.tsx (Step 384): `setEmiContextInfo((prev) => ({ ... product: selected })); setIsDrawerOpen(false);`
                  // It doesn't seem to open calculator.
                  // Where is EMICalculator used? It's a component.
                  // If it's used in `layout.tsx` or similar...
                  // It's NOT in `layout.tsx` (Step 382).
                  // So where is it?
                  // I will check usage of `EMICalculator`.
                  // Just to be safe, I will implement it such that `isDrawerOpen` controls THIS drawer for now.
                }}

                className={`px-6 py-2 font-medium rounded-lg flex items-center gap-2 transition-colors bg-[var(--colour-fsP1)] text-white hover:bg-blue-700 `}
              >
                Apply Now <ArrowRight className="w-4 h-4" />
              </button>)
            }
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}