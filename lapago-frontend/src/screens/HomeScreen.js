import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import axiosInstance from '../api/axiosInstance';

export default function HomeScreen() {
    const [lapangan, setLapangan] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mengambil data lapangan dari backend
        axiosInstance.get('/lapangan')
            .then(response => {
                setLapangan(response.data.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Gagal mengambil data lapangan:', error);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={lapangan}
                keyExtractor={(item) => item.id_lapangan.toString()}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.title}>{item.nama_lapangan}</Text>
                        <Text style={styles.subtitle}>{item.jenis_lapangan} • {item.lokasi}</Text>
                        <Text style={styles.price}>Rp {item.harga_per_jam} / jam</Text>
                        <Text style={styles.status}>Status: {item.status_operasional}</Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5', padding: 10 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    card: { 
        backgroundColor: '#fff', 
        padding: 15, 
        marginBottom: 10, 
        borderRadius: 8,
        elevation: 2 
    },
    title: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
    price: { fontSize: 16, fontWeight: 'bold', color: '#2ecc71', marginTop: 8 },
    status: { fontSize: 12, color: '#999', marginTop: 4 }
});