'use client'
import { useRouter } from "next/navigation"
import { useState, useEffect, } from 'react'
import http from '../utils/http'
import { apis } from "@/utils/apis"
import { encryptPassword } from '@/utils/util'
import { store } from "./store"

export default function Login() {
    const navigate = useRouter()
    const [account, setAccount] = useState('admin')
    const [password, setPassword] = useState('admin')
    const [publicKey, setPublicKey] = useState('')

    useEffect(() => {
      (async function() {
        const res = await fetch('/public_key.pem')
        const publicKey = await res.text()
        console.log('publicKey===', publicKey)
        setPublicKey(publicKey)
      })()
    }, [])

    const toLogin = async () => {
      // rsa 加密密码
      try {
        const pwd = encryptPassword(password, publicKey)
        console.log('pwd===', pwd)
        if (!pwd) return console.log('加密失败')

        const res = await http.post(apis.login, { account, password: pwd })
        console.log('res===', res)
        const { code, data } = res.data

        if (code === 200) {
          store().setToken(data?.accessToken || '')
          navigate.push('/home')
        } else {
          console.log('登录报错===', data)
        }
      } catch(e) {
        console.log('e===', e) 
      }
    }

    return <div className="w-[400px] flex flex-col items-center border border-[#666] rounded-[5px] py-[10px] gap-[10px]">
        <div className="text-[18px] font-[600]">登录</div>
        <div>
          <label htmlFor="account">账户</label>
          <input value={account} onChange={e => setAccount(e.target.value)} 
                id="account" className="ml-[6px] focus:outline-none border-b border-b-[#333]" />
        </div>
        <div>
          <label htmlFor="password">密码</label>
          <input value={password} onChange={e => setPassword(e.target.value)} 
                id="password" className="ml-[6px] focus:outline-none border-b border-b-[#333]" />
        </div>
        <button onClick={toLogin} className="mt-[10px] px-[10px] py-[4px] rounded-[4px] bg-[#333]">确定</button>
    </div>
}