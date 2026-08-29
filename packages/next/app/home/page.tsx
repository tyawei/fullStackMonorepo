'use client'
// import HomePage from "@/pages/homePage"
import { useState, useEffect } from 'react'
import http from '../../utils/http'
import { apis } from '../../utils/apis'
import { getUserInfo, setAccessToken, setUserInfo } from '@/utils/util'
import { store } from '../store'
import { useRouter } from 'next/navigation'

export default function Home() {
    const navigate = useRouter()
    const {loading, setLoading} = store()
    const [user, setUser] = useState({})
    const [historyList, setHistoryList] = useState([])

    const logout = async () => {
        setLoading(true)
        try {
            const res = await http.post(apis.logout)

            if (res.data?.code === 200) {
                setAccessToken('')
                setUserInfo(null)
            }        
        } catch(e) {
            console.log('logout_err===', e)
        } finally {
            navigate.replace('/')
            setLoading(false)
        }
    }

    useEffect(() => {
        setUser(getUserInfo())
        http.get(apis.queryHistory).then(res => {
            if (res.data?.code === 200) {
                setHistoryList(res.data?.data || [])
            }
        })
    }, [])

    return <div>
        <div>
            <button onClick={loading ? () => {} : logout} className="mt-[10px] px-[10px] py-[4px] rounded-[4px] bg-[#333]">
                {loading ? '退出中' : '退出登录'}
            </button>            
        </div><br />
        <div>用户信息：</div>
        <div>{JSON.stringify(user)}</div><br />
        <div>链上交易历史数据：</div>
        <div>{JSON.stringify(historyList)}</div>
    </div>
}