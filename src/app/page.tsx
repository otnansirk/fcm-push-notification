"use client"

import { useMemo, useState } from "react"
import { initializeApp } from "firebase/app"
import { getMessaging, getToken, onMessage } from "firebase/messaging"

export default function Home() {

    const [firebaseConfig, setFirebaseConfig] = useState({
        appKey: "",
        apiKey: "",
        authDomain: "",
        projectId: "",
        storageBucket: "",
        messagingSenderId: "",
        appId: ""
    })
    const [errors, setErrors] = useState<any>({
        appKey: null,
        apiKey: null,
        authDomain: null,
        projectId: null,
        storageBucket: null,
        messagingSenderId: null,
        appId: null
    })
    const [myToken, setMyToken] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMesssage] = useState<any>(null)


    const onGetToken = () => {
        const validate: any = validation()
        if (Object.keys(validate).length) {
            setErrors(validate)
            return
        }

        setLoading(true)
        setErrors((state:any) => ({...state, generateToken: null}))
        const app = initializeApp(firebaseConfig)
        const messaging = getMessaging(app)
        setMesssage(messaging)

        if (!("Notification" in window)) {
            console.log("The browser is not supports notifications")
        } else if (Notification.permission === "granted") {
            generateToken(messaging)
                .then(token => {
                    setMyToken(token)
                    onNotification()
                })
                .catch(() => setErrors((state:any) => ({...state, generateToken: 'Failed Generate Token'})))
                .finally(() => setLoading(false))



        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then((permission) => {
                if (permission === "granted") {
                    generateToken(messaging)
                        .then(token => {
                            setMyToken(token)
                            onNotification()
                        })
                        .catch(() => setErrors((state:any) => ({...state, generateToken: 'Failed Generate Token'})))
                        .finally(() => setLoading(false))

                }
            });
        }
    }

    const generateToken = async (messaging: any) => {
        return await getToken(messaging, {vapidKey: firebaseConfig.appKey})
    }

    const validation = () => {
        const required: (keyof typeof firebaseConfig)[] = [
            "appKey",
            "apiKey",
            "authDomain",
            "projectId",
            "storageBucket",
            "messagingSenderId",
            "appId",
        ]
        let error: { [key in keyof typeof firebaseConfig]?: string } = {};
        required.forEach((field: keyof typeof firebaseConfig) => {
            if (!firebaseConfig[field]) {
                error[field] = `${field} is required`
            }
        });

        return error
    }

    const onNotification = () => {
        if ('serviceWorker' in navigator) {
            // this will register the service worker or update it. More on service worker soon
            navigator.serviceWorker.register('./firebase-messaging-sw.js', { scope: './' }).then(function (registration) {
                console.log("Service Worker Registered");
                setTimeout(() => {
                // display the notificaiton
                registration.showNotification('title nya').then(done => {
                    console.log("sent notificaiton to user");
                    const audio = new Audio("./notif.mp3"); // only works on windows chrome
                    audio.play();
                }).catch(err => {
                    console.error("Error sending notificaiton to user", err);
                });
                registration.update();
                }, 100);
            }).catch(function (err) {
                console.log("Service Worker Failed to Register", err);
            });
        }
    }

    if (message) {
        onMessage(message, (payload) => {
            console.log('Message received. ', payload);
        });
    }

    return (
        <main className="p-24 max-w-7xl m-auto">
            {
                [
                    "appKey",
                    "apiKey",
                    "authDomain",
                    "projectId",
                    "storageBucket",
                    "messagingSenderId",
                    "appId",
                ].map(field => (
                    <div key={field} className="text-center mt-6 mb-2">
                        <div className={`mb-2 font-bold ${!!errors[field] && 'text-red-600'}`}>{field}</div>
                        <input
                            onChange={evt => {
                                setFirebaseConfig(state => ({...state, [field]: evt.target.value}))
                                setErrors((state:any) => ({...state, [field]: null}))
                            }}
                            className={`rounded p-2 text-gray-500 w-[100%] text-center ${!errors[field] ? 'ring-gray-600 ring-1': 'ring-red-600 ring-4'}`}/>
                        <small className="text-red-600 mt-2 block">{errors[field]}</small>
                    </div>
                ))
            }
            {/* <div className="text-center mt-6 mb-2">
                <div className={`mb-2 ${!!errors.appKey && 'text-red-600'}`}>APP Key</div>
                <input
                    onChange={evt => {
                        setFirebaseConfig(state => ({...state, appKey: evt.target.value}))
                        setErrors(state => ({...state, appKey: null}))
                    }}
                    className={`rounded p-2 text-gray-500 w-[100%] text-center ${!errors.appKey ? 'ring-gray-600 ring-1': 'ring-red-600 ring-4'}`}/>
                <small className="text-red-600 mt-2 block">{errors.appKey}</small>
            </div>
            <div className="text-center mt-6 mb-2">
                <div className={`mb-2 ${!!errors.apiKey && 'text-red-600'}`}>Api Key</div>
                <input
                    onChange={evt => {
                        setFirebaseConfig(state => ({...state, apiKey: evt.target.value}))
                        setErrors(state => ({...state, apiKey: null}))
                    }}
                    className={`rounded p-2 text-gray-500 w-[100%] text-center ${!errors.apiKey ? 'ring-gray-600 ring-1': 'ring-red-600 ring-4'}`}/>
                <small className="text-red-600 mt-2 block">{errors.apiKey}</small>
            </div>
            <div className="text-center mt-6 mb-2">
                <div className={`mb-2 ${!!errors.authDomain && 'text-red-600'}`}>Auth Domain</div>
                <input
                    onChange={evt => {
                        setFirebaseConfig(state => ({...state, authDomain: evt.target.value}))
                        setErrors(state => ({...state, authDomain: null}))
                    }}
                    className={`rounded p-2 text-gray-500 w-[100%] text-center ${!errors.authDomain ? 'ring-gray-600 ring-1': 'ring-red-600 ring-4'}`}/>
                <small className="text-red-600 mt-2 block">{errors.authDomain}</small>
            </div>
            <div className="text-center mt-6 mb-2">
                <div className={`mb-2 ${!!errors.projectId && 'text-red-600'}`}>Project Id</div>
                <input
                    onChange={evt => {
                        setFirebaseConfig(state => ({...state, projectId: evt.target.value}))
                        setErrors(state => ({...state, projectId: null}))
                    }}
                    className={`rounded p-2 text-gray-500 w-[100%] text-center ${!errors.projectId ? 'ring-gray-600 ring-1': 'ring-red-600 ring-4'}`}/>
                <small className="text-red-600 mt-2 block">{errors.projectId}</small>
            </div>
            <div className="text-center mt-6 mb-2">
                <div className={`mb-2 ${!!errors.storageBucket && 'text-red-600'}`}>Storage Bucket</div>
                <input
                    onChange={evt => {
                        setFirebaseConfig(state => ({...state, storageBucket: evt.target.value}))
                        setErrors(state => ({...state, storageBucket: null}))
                    }}
                    className={`rounded p-2 text-gray-500 w-[100%] text-center ${!errors.storageBucket ? 'ring-gray-600 ring-1': 'ring-red-600 ring-4'}`}/>
                <small className="text-red-600 mt-2 block">{errors.storageBucket}</small>
            </div>
            <div className="text-center mt-6 mb-2">
                <div className={`mb-2 ${!!errors.messagingSenderId && 'text-red-600'}`}>Messaging Sender Id</div>
                <input
                    onChange={evt => {
                        setFirebaseConfig(state => ({...state, messagingSenderId: evt.target.value}))
                        setErrors(state => ({...state, messagingSenderId: null}))
                    }}
                    className={`rounded p-2 text-gray-500 w-[100%] text-center ${!errors.messagingSenderId ? 'ring-gray-600 ring-1': 'ring-red-600 ring-4'}`}/>
                <small className="text-red-600 mt-2 block">{errors.messagingSenderId}</small>
            </div>
            <div className="text-center mt-6 mb-2">
                <div className={`mb-2 ${!!errors.appId && 'text-red-600'}`}>App Id</div>
                <input
                    onChange={evt => {
                        setFirebaseConfig(state => ({...state, appId: evt.target.value}))
                        setErrors(state => ({...state, appId: null}))
                    }}
                    className={`rounded p-2 text-gray-500 w-[100%] text-center ${!errors.appId ? 'ring-gray-600 ring-1': 'ring-red-600 ring-4'}`}/>
                <small className="text-red-600 mt-2 block">{errors.appId}</small>
            </div> */}
            <div className="flex justify-center mt-10">
                <button className="bg-green-500 p-3 rounded hover:bg-green-600 w-80 flex items-center gap-2 justify-center" onClick={onGetToken}>
                    {
                        loading &&
                            <span className="relative flex h-5 w-5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-5 w-5 bg-white"></span>
                            </span>
                    }
                    {loading ? 'Loading...': 'Get Token'}
                </button>
            </div>
            {errors.generateToken && <div className="text-red-600">! {errors.generateToken}</div>}
            {
                myToken && <>
                    <div className="font-bold mb-3">MY TOKEN</div>
                    <textarea
                        readOnly
                        className="w-[100%] text-gray-600 p-4"
                        rows={6}
                        value={myToken}
                    />
                </>
            }
        </main>
    )
}
