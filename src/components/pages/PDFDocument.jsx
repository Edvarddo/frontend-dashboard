import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#E4E4E4',
    padding: 20,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
  image: {
    marginVertical: 15,
    marginHorizontal: 'auto',
  },
});

export const PDFDocument = ({ cardsData, barChartUrl, pieChartUrl, lineChartUrl }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>Dashboard Municipal</Text>
        <Text style={styles.subtitle}>Resumen de Estadísticas</Text>
        <Text style={styles.text}>Publicaciones Recibidas: {cardsData?.publicaciones || 0}</Text>
        <Text style={styles.text}>Usuarios Activos: {cardsData?.usuarios || 0}</Text>
        <Text style={styles.text}>Publicaciones Resueltas: {cardsData?.problemas_resueltos || 0}</Text>
        <Text style={styles.text}>Tasa de Resolución: {((cardsData?.problemas_resueltos / cardsData?.publicaciones) * 100).toFixed(1)}%</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.subtitle}>Publicaciones por Mes y Categoría</Text>
        <Image style={styles.image} src={barChartUrl} />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.subtitle}>Distribución de Publicaciones por Categoría</Text>
        <Image style={styles.image} src={pieChartUrl} />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.subtitle}>Tendencia de Resolución de Problemas</Text>
        <Image style={styles.image} src={lineChartUrl} />
      </View>
    </Page>
  </Document>
);


export default PDFDocument;