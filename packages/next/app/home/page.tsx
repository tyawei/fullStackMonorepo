// import HomePage from "@/pages/homePage"
import { useState, useEffect } from 'react'
import http from '../../utils/http'
import { apis } from '../../utils/apis'

export default function Home() {
    const [user, setUser] = useState({})

    useEffect(() => {
        http.get(apis.getUser).then(res => {
            console.log('query===', res)
            if (res?.data?.code === 200) {
                setUser(res.data.data)
            }
        })
    }, [])

    return <div>
        <div>{JSON.stringify(user)}</div>
    </div>
}