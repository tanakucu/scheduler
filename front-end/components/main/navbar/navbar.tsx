"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import styles from "./navbar.module.css";

export default function Navbar() {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [errors, setErrors] = useState({
        email: "",
        password: "",
        confirmPassword: ""
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
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    function validateForm() {
        const newErrors = { email: "", password: "", confirmPassword: "" };

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

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (validateForm()) {
            console.log("Form submitted", formData);
        }
    }

    const navLinks = [
        { href: "/", label: "Өрөө захиалах" },
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
                    <button
                        className={styles.loginButton}
                        onClick={() => openModal(true)}
                    >
                        Нэвтрэх
                    </button>
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
                                <button className={styles.submitButton} type="submit">
                                    {isLogin ? "Нэвтрэх" : "Бүртгүүлэх"}
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
                                onClick={() => setIsLogin(prev => !prev)}
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