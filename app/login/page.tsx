'use client'


import {Button, Image, Input} from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import {useState} from "react";


export default function Login() {
    const [loadings, setLoadings] = useState<boolean[]>([]);

    const enterLoading = (index:number) => {
        setLoadings((prev) => {
            const newLoading = [...prev];
            newLoading[index] = true;
            return newLoading;
        });

        setTimeout(() => {
            setLoadings((prevLoadings) => {
                const newLoadings = [...prevLoadings];
                newLoadings[index] = false;
                return newLoadings;
            });
        }, 3000)
    };

    return (
        <>
            <div className="flex flex-row items-center justify-center w-full h-screen bg-[#EFF3FD] gap-6 px-8">
                <div className="flex flex-col items-center justify-center w-6/12 h-2/4 bg-gradient-to-br from-[#F5871F] via-[#EF6C15] to-[#D9420F] rounded-2xl">
                    <h2 className="text-2xl text-white font-bold items-start p-4">Welcome to Drenix drivers database</h2>
                    <div className="flex flex-col items-center justify-center w-6/12 h-1/2 gap-3">
                        <Input placeholder="Username" className="w-full h-12 bg-white rounded-lg px-2" />
                        <Input.Password  placeholder="Password"
                                         className="w-full h-12 bg-white rounded-lg px-2"
                                         iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                        />
                    </div>
                    <Button loading={loadings[0]} onClick={() => enterLoading(0)} style={{width:'50%', height:"48px", padding:"8px 16px", background:"white", borderRadius: "8px"}} >Login</Button>
                </div>
                <div className="flex flex-col items-center justify-center w-6/12 h-2/4 ">
                    <div className="flex flex-col items-center justify-center w-6/12 h-2/4 rounded-2xl">
                        <Image src="/images/logo-rm.png" alt="logo" className="w-full h-full" preview={false}/>
                    </div>
                </div>
            </div>
        </>
    )
}
