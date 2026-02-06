"use client";

import React from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/app/context/AuthContext";
import { UserLock } from "lucide-react";

export default function LoginAlertDialog() {
    const { showLoginAlert, setShowLoginAlert, setloginDailogOpen } = useAuth();

    const handleLoginConfirm = () => {
        setShowLoginAlert(false);
        setloginDailogOpen(true);
    };

    return (
        <AlertDialog open={showLoginAlert} onOpenChange={setShowLoginAlert}>
            <AlertDialogContent className='bg-white border-none'>
                <AlertDialogHeader>
                    <AlertDialogTitle className='text-[var(--colour-fsP2)] items-center w-full flex justify-start text-lg gap-4'>
                        <UserLock className="w-6 h-6 fill-current " /> <span>Please Login</span>
                    </AlertDialogTitle>
                    <AlertDialogDescription className='text-base'>
                        You need to be logged in to continue. Would you like to login now?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-row gap-2 justify-center sm:justify-end">
                    <AlertDialogCancel className='flex-1 sm:flex-none cursor-pointer border-gray-200 hover:bg-gray-100/50 rounded-xl h-10'>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        className='flex-1 sm:flex-none cursor-pointer h-10 bg-[var(--colour-fsP2)] hover:bg-[var(--colour-fsP2)]/90 text-white shadow-md hover:shadow-lg transition-all rounded-xl border-none'
                        onClick={handleLoginConfirm}
                    >
                        Login
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
