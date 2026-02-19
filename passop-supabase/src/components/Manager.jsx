import React from 'react'
import { useRef, useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';
import 'react-toastify/dist/ReactToastify.css';

// Initialize Supabase client once (outside component)
const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
)

const Manager = () => {
    const ref = useRef()
    const passwordRef = useRef()
    const [form, setform] = useState({ site: "", username: "", password: "" })
    const [passwordArray, setPasswordArray] = useState([])
    const [fieldError, setFieldError] = useState("")
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deleteId, setDeleteId] = useState("")

    const getPasswords = async () => {
        console.log('🔍 Fetching passwords from Supabase...')
        const { data, error } = await supabase
            .from('passwords')
            .select('*')
        if (error) {
            console.error('❌ Error fetching passwords:', error)
            return []
        }
        console.log('✅ Fetched passwords:', data)
        console.log('📊 Data length:', data ? data.length : 0)
        return data
    }


    useEffect(() => {
        getPasswords().then(data => setPasswordArray(data))
    }, [])

    useEffect(() => {
        // Set initial eye icon
        if (ref.current) {
            ref.current.src = "/icons/eye.png"
        }
    }, [])


    const copyText = (text) => {
        toast('Copied to clipboard!', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
        });
        navigator.clipboard.writeText(text)
    }

    const showPassword = () => {
        if (passwordRef.current.type === "password") {
            passwordRef.current.type = "text"
            ref.current.src = "/icons/open-eye.png"
        } else {
            passwordRef.current.type = "password"
            ref.current.src = "/icons/eye.png"
        }
    }

    const savePassword = async () => {
        console.log('🔘 Save button clicked!')
        console.log('🔍 Current form data:', form)
        
        if (form.site.length > 3 && form.username.length > 3 && form.password.length > 3) {
            console.log('🔍 Validation passed - proceeding with save...')
            setFieldError("") // Clear error when validation passes
            let result;
            
            if (form.id) {
                // Update existing password
                console.log('📝 Updating existing password with ID:', form.id)
                console.log('🔍 Update payload:', { site: form.site, username: form.username, password: form.password })
                
                const { data, error } = await supabase
                    .from('passwords')
                    .update({ site: form.site, username: form.username, password: form.password })
                    .eq('id', form.id)
                    .select() // Add .select() to return updated data
                
                console.log('🔍 Supabase update response:', { data, error })
                result = { data, error }
            } else {
                // Insert new password
                console.log('➕ Inserting new password')
                const { data, error } = await supabase
                    .from('passwords')
                    .insert([form])
                
                console.log('🔍 Supabase insert response:', { data, error })
                result = { data, error }
            }
            
            if (result.error) {
                console.error('❌ Error saving password:', result.error)
                toast('Error: Password not saved!')
                return
            }
            
            console.log('✅ Password saved successfully, Supabase response:', result.data)
            setform({ site: "", username: "", password: "" })
            const updatedPasswords = await getPasswords()
            console.log('🔄 Updated passwords array:', updatedPasswords)
            setPasswordArray([...updatedPasswords]) // Force re-render with new array reference
            toast('Password saved!', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
        } else {
            console.log('❌ Validation failed - form data:', form)
            if (form.password.length <= 3) {
                setFieldError("Password should be more than 3 characters")
            } else if (form.site.length === 0) {
                toast('Error: Site URL is required!');
            } else if (form.username.length === 0) {
                toast('Error: Username is required!');
            } else {
                toast('Error: Please fill in all fields!');
            }
        }
    }

    const deletePassword = async (id) => {
        console.log("Deleting password with id ", id)
        setDeleteId(id)
        setShowDeleteModal(true)
    }

    const confirmDelete = async () => {
        const { error } = await supabase
            .from('passwords')
            .delete()
            .eq('id', deleteId)
        
        if (error) {
            console.error('Error deleting password:', error)
            toast('Error: Password not deleted!')
            return
        }
        
        const updatedPasswords = await getPasswords()
        setPasswordArray([...updatedPasswords]) // Force re-render with new array reference
        toast('Password Deleted!', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true, 
            draggable: true,
            progress: undefined,
            theme: "dark",
        });
        setShowDeleteModal(false)
        setDeleteId("")
    }

    const editPassword = (id) => {
        setform({ ...passwordArray.filter(i => i.id === id)[0], id: id })
        setPasswordArray(passwordArray.filter(item => item.id !== id))
    }


    const handleChange = (e) => {
        setform({ ...form, [e.target.name]: e.target.value })
        setFieldError("") // Clear error when user starts typing
    }


    return (
        <>
            <ToastContainer />
            {/* <div className="absolute inset-0 -z-10 h-full w-full bg-green-50 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"><div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-green-400 opacity-20 blur-[100px]"></div></div> */}
            <div className=" p-3 md:mycontainer min-h-[88.2vh] ">
                <h1 className='text-4xl text font-bold text-center'>
                    <span className='text-green-500'> &lt;</span>

                    <span>Pass</span><span className='text-green-500'>OP/&gt;</span>

                </h1>
                <p className='text-green-900 text-lg text-center'>Your own Password Manager</p>

                <div className="flex flex-col p-4 text-black gap-8 items-center">
                    <input value={form.site} onChange={handleChange} placeholder='Enter website URL' className='rounded-full border border-green-500 w-full p-4 py-1' type="text" name="site" id="site" />
                    <div className="flex flex-col md:flex-row w-full justify-between gap-8 items-start">
                        <input value={form.username} onChange={handleChange} placeholder='Enter Username' className='rounded-full border border-green-500 w-full p-4 py-1' type="text" name="username" id="username" />
                        <div className="relative">
                            <input ref={passwordRef} value={form.password} onChange={handleChange} placeholder='Enter Password' className='rounded-full border border-green-500 w-full p-4 py-1' type="password" name="password" id="password" />
                            <span className='absolute right-[3px] top-[4px] cursor-pointer' onClick={showPassword}>
                                <img ref={ref} className='p-1' width={26} src="/icons/eye.png" alt="eye" />
                            </span>
                            {fieldError && <p className="text-red-500 text-sm mt-1">{fieldError}</p>}
                        </div>

                    </div>
                    <button onClick={savePassword} className='flex justify-center items-center gap-2 bg-green-400 hover:bg-green-300 rounded-full px-8 py-2 w-fit border border-green-900'>
                        <lord-icon
                            src="https://cdn.lordicon.com/jgnvfzqg.json"
                            trigger="hover" >
                        </lord-icon>
                        Save</button>
                </div>

                <div className="passwords">
                    <h2 className='font-bold text-2xl py-4'>Your Passwords</h2>
                    {passwordArray.length === 0 && <div> No passwords to show</div>}
                    {passwordArray.length != 0 && <table className="table-auto w-full rounded-md overflow-hidden mb-10">
                        <thead className='bg-green-800 text-white'>
                            <tr>
                                <th className='py-2'>Site</th>
                                <th className='py-2'>Username</th>
                                <th className='py-2'>Password</th>
                                <th className='py-2'>Actions</th>
                            </tr>
                        </thead>
                        <tbody className='bg-green-100'>
                            {passwordArray.map((item, index) => {
                                return <tr key={index}>
                                    <td className='py-2 border border-white text-center'>
                                        <div className='flex items-center justify-center '>
                                            <a href={item.site} target='_blank'>{item.site}</a>
                                            <div className='lordiconcopy size-7 cursor-pointer' onClick={() => { copyText(item.site) }}>
                                                <lord-icon
                                                    style={{ "width": "25px", "height": "25px", "paddingTop": "3px", "paddingLeft": "3px" }}
                                                    src="https://cdn.lordicon.com/iykgtsbt.json"
                                                    trigger="hover" >
                                                </lord-icon>
                                            </div>
                                        </div>
                                    </td>
                                    <td className='py-2 border border-white text-center'>
                                        <div className='flex items-center justify-center '>
                                            <span>{item.username}</span>
                                            <div className='lordiconcopy size-7 cursor-pointer' onClick={() => { copyText(item.username) }}>
                                                <lord-icon
                                                    style={{ "width": "25px", "height": "25px", "paddingTop": "3px", "paddingLeft": "3px" }}
                                                    src="https://cdn.lordicon.com/iykgtsbt.json"
                                                    trigger="hover" >
                                                </lord-icon>
                                            </div>
                                        </div>
                                    </td>
                                    <td className='py-2 border border-white text-center'>
                                        <div className='flex items-center justify-center '>
                                            <span>{"*".repeat(item.password.length)}</span>
                                            <div className='lordiconcopy size-7 cursor-pointer' onClick={() => { copyText(item.password) }}>
                                                <lord-icon
                                                    style={{ "width": "25px", "height": "25px", "paddingTop": "3px", "paddingLeft": "3px" }}
                                                    src="https://cdn.lordicon.com/iykgtsbt.json"
                                                    trigger="hover" >
                                                </lord-icon>
                                            </div>
                                        </div>
                                    </td>
                                    <td className='justify-center py-2 border border-white text-center'>
                                        <span className='cursor-pointer mx-1' onClick={() => { editPassword(item.id) }}>
                                            <lord-icon
                                                src="https://cdn.lordicon.com/gwlusjdu.json"
                                                trigger="hover"
                                                style={{ "width": "25px", "height": "25px" }}>
                                            </lord-icon>
                                        </span>
                                        <span className='cursor-pointer mx-1' onClick={() => { deletePassword(item.id) }}>
                                            <lord-icon
                                                src="https://cdn.lordicon.com/skkahier.json"
                                                trigger="hover"
                                                style={{ "width": "25px", "height": "25px" }}>
                                            </lord-icon>
                                        </span>
                                    </td>
                                </tr>
                            })}
                        </tbody>
                    </table>}
                </div>
            </div>

            {/* Custom Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 border-2 border-green-500">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Delete</h3>
                        <p className="text-gray-600 mb-6">Are you sure you want to delete this password?</p>
                        <div className="flex gap-3 justify-end">
                            <button 
                                onClick={() => {setShowDeleteModal(false); setDeleteId("")}}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </>
    )
}

export default Manager