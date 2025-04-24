"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import styles from "./navbar.module.css";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Navbar() {
    const { data: session, status } = useSession();
    const isLoading = status === "loading";
    const isAuthenticated = status === "authenticated";
    
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [errors, setErrors] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        general: ""
    });

    function toggleMenu() {
        setIsMenuOpen(prev => !prev);
    }

    function openModal(login: boolean) {
        setIsLogin(login);
        setIsModalOpen(true);
    }

    function closeModal() {
        setIsModalOpen(false);
        setFormData({
            email: "",
            password: "",
            confirmPassword: ""
        });
        setErrors({
            email: "",
            password: "",
            confirmPassword: "",
            general: ""
        });
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    function validateForm() {
        const newErrors = { email: "", password: "", confirmPassword: "", general: "" };

        const emailRegex = /^[^\s@]+@stud\.num\.edu\.mn$/;
        if (!formData.email) {
            newErrors.email = "Цахим шуудан шаардлагатай";
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = "Буруу цахим шуудан хаяг";
        }

        if (!formData.password) {
            newErrors.password = "Нууц үг шаардлагатай";
        } else if (formData.password.length < 8) {
            newErrors.password = "Нууц үг дор хаяж 8 тэмдэгт байх ёстой";
        }

        if (!isLogin && formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Нууц үг таарахгүй байна";
        }

        setErrors(newErrors);
        return Object.values(newErrors).every(error => error === "");
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (validateForm() && !isSubmitting) {
            setIsSubmitting(true);
            
            try {
                if (isLogin) {
                    const result = await signIn("credentials", {
                        redirect: false,
                        email: formData.email,
                        password: formData.password
                    });
                    
                    if (result?.error) {
                        setErrors(prev => ({
                            ...prev,
                            general: "Нэвтрэх нэр эсвэл нууц үг буруу байна"
                        }));
                    } else {
                        closeModal();
                    }
                } else {
                    const response = await fetch(`http://localhost:3030/auth/register`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            email: formData.email,
                            password: formData.password,
                            name: formData.email
                        }),
                    });
                    
                    const data = await response.json();
                    
                    if (!response.ok) {
                        setErrors(prev => ({
                            ...prev,
                            general: data.error || "Бүртгэлийн үйл явцад алдаа гарлаа"
                        }));
                    } else {
                        const result = await signIn("credentials", {
                            redirect: false,
                            email: formData.email,
                            password: formData.password
                        });
                        
                        if (result?.error) {
                            setErrors(prev => ({
                                ...prev,
                                general: "Бүртгэл амжилттай үүсгэгдсэн боловч нэвтрэх явцад алдаа гарлаа"
                            }));
                        } else {
                            closeModal();
                        }
                    }
                }
            } catch (error) {
                console.error("Auth error:", error);
                setErrors(prev => ({
                    ...prev,
                    general: "Серверийн алдаа гарлаа. Дараа дахин оролдоно уу."
                }));
            } finally {
                setIsSubmitting(false);
            }
        }
    }

    function handleSignOut() {
        signOut({ redirect: false });
    }

    const navLinks = [
        { href: "/", label: "Өрөө захиалах - Календар" },
        { href: "/book", label: "Өрөө захиалах - Filter" },
        { href: "/room", label: "Өрөө үүсгэх" },
        { href: "/contact", label: "Холбогдох" }
    ];

    return (
        <>
            <nav className={styles.navbar}>
                <div className={styles.navbar_left}>
                    <Link href="/">
                        <Image
                            src="https://auth.num.edu.mn/oauth2/Image/num-logo.svg"
                            width={40}
                            height={40}
                            alt="Logo"
                            priority
                        />
                    </Link>
                </div>
                <div 
                    className={styles.burgerMenu} 
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    <div className={styles.burgerLine}></div>
                    <div className={styles.burgerLine}></div>
                    <div className={styles.burgerLine}></div>
                </div>
                <div className={`${styles.middle} ${isMenuOpen ? styles.showMenu : ""}`}>
                    {navLinks.map((link) => (
                        <div
                            key={link.href}
                            className={`${styles.navItem} ${pathname === link.href ? styles.active : ""}`}
                        >
                            <Link href={link.href}>{link.label}</Link>
                        </div>
                    ))}
                </div>
                <div className={styles.right}>
                    {isLoading ? (
                        <span className={styles.loadingIndicator}>Уншиж байна...</span>
                    ) : isAuthenticated ? (
                        <div className={styles.userMenu}>
                            <span className={styles.userName}>
                                {session?.user?.name || session?.user?.email?.split('@')[0]}
                            </span>
                            <button 
                                className={styles.logoutButton}
                                onClick={handleSignOut}
                            >
                                Гарах
                            </button>
                        </div>
                    ) : (
                        <button
                            className={styles.loginButton}
                            onClick={() => openModal(true)}
                        >
                            Нэвтрэх
                        </button>
                    )}
                </div>
            </nav>

            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>
                                {isLogin ? "Нэвтрэх" : "Бүртгүүлэх"}
                            </h3>
                            <button 
                                className={styles.closeButton}
                                onClick={closeModal}
                                aria-label="close"
                            >
                                ×
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            {errors.general && (
                                <p className={styles.generalError}>{errors.general}</p>
                            )}
                            <form onSubmit={handleSubmit}>
                                <div className={styles.inputGroup}>
                                    <label htmlFor="email">Цахим шуудан</label>
                                    <input
                                        type="email"
                                        className={styles.input}
                                        id="email"
                                        name="email"
                                        placeholder="21B1NUM1234@stud.num.edu.mn"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                    {errors.email && (
                                        <p className={styles.errorText}>{errors.email}</p>
                                    )}
                                </div>
                                <div className={styles.inputGroup}>
                                    <label htmlFor="password">Нууц үг</label>
                                    <input
                                        type="password"
                                        className={styles.input}
                                        id="password"
                                        name="password"
                                        placeholder="***********"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    {errors.password && (
                                        <p className={styles.errorText}>{errors.password}</p>
                                    )}
                                </div>
                                {!isLogin && (
                                    <div className={styles.inputGroup}>
                                        <label htmlFor="confirm_password">Нууц үг давтах</label>
                                        <input
                                            type="password"
                                            className={styles.input}
                                            id="confirm_password"
                                            name="confirmPassword"
                                            placeholder="***********"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                        />
                                        {errors.confirmPassword && (
                                            <p className={styles.errorText}>{errors.confirmPassword}</p>
                                        )}
                                    </div>
                                )}
                                <button 
                                    className={`${styles.submitButton} ${isSubmitting ? styles.submitting : ''}`} 
                                    type="submit" 
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Уншиж байна...' : (isLogin ? "Нэвтрэх" : "Бүртгүүлэх")}
                                </button>
                            </form>
                            <div className={styles.dividerContainer}>
                                <div className={styles.divider}></div>
                                <div className={styles.dividerText}>
                                    <span>Эсвэл</span>
                                </div>
                            </div>
                            <button 
                                className={styles.secondaryButton} 
                                type="button" 
                                onClick={() => {
                                    setIsLogin(prev => !prev);
                                    setErrors({
                                        email: "",
                                        password: "",
                                        confirmPassword: "",
                                        general: ""
                                    });
                                }}
                            >
                                {isLogin ? "Бүртгүүлэх" : "Нэвтрэх"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}