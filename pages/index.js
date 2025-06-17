import { useEffect,useState } from 'react';
import Layout from '../components/layout';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js'; 

export default function Home() {
  const [dados,setDados] = useState({labels:[],datasets:[]});

  Chart.register(ArcElement, Tooltip, Legend);
  
  useEffect(()=>{
    fetch('/api/despesas').then(r=>r.json()).then(data=>{
      const grouped={}; data.forEach(i=>{
        grouped[i.categoria]=(grouped[i.categoria]||0)+parseFloat(i.valor);
      });
      setDados({labels:Object.keys(grouped),datasets:[{data:Object.values(grouped)}]});
    });
  },[]);
  return (
    <Layout>
      <h2 className="text-xl font-semibold mb-4">Despesas por Categoria</h2>
      <Pie data={dados} />
    </Layout>
  );
}