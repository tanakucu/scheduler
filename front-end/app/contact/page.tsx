"use client";

import { useState } from "react";
import Navbar from "@/components/main/navbar/navbar";
import style from "./contact.module.css";

export default function ContactPage() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error("Маягтыг илгээхэд алдаа гарлаа");
            }

            alert("Маягт амжилттай илгээгдлээ!");
        } catch (error) {
            console.error("Маягт илгээхэд алдаа гарлаа:", error);
            alert("Маягтыг илгээхэд алдаа гарлаа");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className={style.main}>
                <div className={style.container}>
                    <div className={style.formWrapper}>
                        <h1 className={style.title}>Холбоо барих</h1>
                        <p className={style.description}>
                            Та доорх маягтыг бөглөж бидэнтэй холбогдоорой. Бид аль болох хурдан хариу өгөх болно.
                        </p>
                        <form onSubmit={handleSubmit} className={style.form}>
                            <input
                                className={style.input}
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Таны нэр"
                                required
                            />
                            <input
                                className={style.input}
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Таны и-мэйл хаяг"
                                required
                            />
                            <input
                                className={style.input}
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Таны утасны дугаар"
                            />
                            <input
                                className={style.input}
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                placeholder="Зурвасын сэдэв"
                            />
                            <textarea
                                className={style.textarea}
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="Таны зурвас"
                                rows={4}
                                required
                            />
                            <div className={style.buttonWrapper}>
                                <button
                                    type="submit"
                                    className={style.button}
                                    disabled={loading}
                                >
                                    {loading ? "Илгээж байна..." : "Илгээх"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
