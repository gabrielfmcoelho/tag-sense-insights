import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Checkbox } from "@/components/ui/checkbox";
import { AspectData, TimelinePoint } from "@/lib/types";
import { 
  ChartContainer, 
  ChartTooltipContent 
} from "@/components/ui/chart";

interface TimelineChartProps {
  data: AspectData[];
  selectedAspects: string[];
  setSelectedAspects: React.Dispatch<React.SetStateAction<string[]>>;
}

const colors = [
  "#1D5AA7", // Primary (cor da logo)
  "#22c55e", // Green
  "#ef4444", // Red
  "#3b82f6", // Blue
  "#f59e0b", // Yellow
  "#8b5cf6", // Purple
  "#0B2344", // Dark Blue (cor da logo)
];

const TimelineChart = ({ data, selectedAspects, setSelectedAspects }: TimelineChartProps) => {
  const allAspects = data.map(aspect => aspect.name);
  
  // Unir todos os pontos de dados em uma lista com a mesma data base
  const combinedData: (TimelinePoint & { [key: string]: number })[] = [];
  const allDates = Array.from(new Set(data.flatMap(aspect => aspect.timelineData.map(point => point.date))));
  
  allDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime()).forEach(date => {
    const point: any = { date };
    
    data.forEach(aspect => {
      const matchingPoint = aspect.timelineData.find(p => p.date === date);
      point[aspect.name] = matchingPoint ? matchingPoint.value : null;
    });
    
    combinedData.push(point);
  });
  
  // Pegar apenas os últimos 7 dias para evitar sobrecarga do gráfico
  const recentData = combinedData.slice(-7);
  
  const toggleAspect = (aspect: string) => {
    if (selectedAspects.includes(aspect)) {
      setSelectedAspects(selectedAspects.filter(a => a !== aspect));
    } else {
      setSelectedAspects([...selectedAspects, aspect]);
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-3">
        {allAspects.map((aspect, index) => (
          <div key={aspect} className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded shadow-sm hover:bg-gray-100 transition-colors">
            <Checkbox 
              id={`aspect-${index}`} 
              checked={selectedAspects.includes(aspect)}
              onCheckedChange={() => toggleAspect(aspect)}
              className="data-[state=checked]:bg-[#1D5AA7] data-[state=checked]:text-white h-4 w-4"
            />
            <label 
              htmlFor={`aspect-${index}`} 
              className="text-sm font-medium cursor-pointer select-none"
              style={{ color: selectedAspects.includes(aspect) ? colors[index % colors.length] : 'inherit' }}
            >
              {aspect}
            </label>
          </div>
        ))}
      </div>
      
      <div className="h-[420px] w-full">
        <ChartContainer 
          config={
            data.reduce((config, aspect, i) => {
              config[aspect.name] = { 
                color: colors[i % colors.length] 
              };
              return config;
            }, {} as Record<string, { color: string }>)
          }
        >
          <LineChart 
            data={recentData}
            margin={{ top: 20, right: 30, left: 15, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => {
                const d = new Date(date);
                return `${d.getDate()}/${d.getMonth() + 1}`;
              }}
              tick={{fontSize: 12}}
              angle={-45}
              textAnchor="end"
              height={60}
              dy={15}
              tickMargin={10}
              label={{ 
                value: 'Data', 
                position: 'bottom', 
                offset: 40,
                style: { fontSize: 12, fill: '#666' }
              }}
            />
            <YAxis 
              domain={[0, 10]} 
              tick={{fontSize: 12}} 
              width={40}
              tickCount={6}
              label={{ 
                value: 'Nota', 
                angle: -90, 
                position: 'left',
                style: { textAnchor: 'middle', fontSize: 12, fill: '#666' }
              }}
            />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend 
              verticalAlign="top" 
              height={25}
              wrapperStyle={{ fontSize: 12 }}
              iconType="circle"
              iconSize={8}
            />
            {data.map((aspect, index) => (
              selectedAspects.includes(aspect.name) && (
                <Line
                  key={aspect.name}
                  type="monotone"
                  dataKey={aspect.name}
                  stroke={colors[index % colors.length]}
                  activeDot={{ r: 5 }}
                  strokeWidth={2}
                  connectNulls
                  dot={{ strokeWidth: 2, r: 3 }}
                />
              )
            ))}
          </LineChart>
        </ChartContainer>
      </div>
    </div>
  );
};

export default TimelineChart;
