import { Line, LineChart, ResponsiveContainer } from "recharts";
import { Box } from "@chakra-ui/react";

export interface SparklinePoint {
  date: string;
  count: number;
}

export function Sparkline({ data, color = "#a78bfa", height = 40 }: { data: SparklinePoint[]; color?: string; height?: number }) {
  if (data.length < 2) {
    return null;
  }

  return (
    <Box height={height} width="100%">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <Line 
            type="monotone" 
            dataKey="count" 
            stroke={color} 
            strokeWidth={2} 
            dot={false} 
            isAnimationActive={true}
            animationDuration={1000}
            animationEasing="ease-in-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}
