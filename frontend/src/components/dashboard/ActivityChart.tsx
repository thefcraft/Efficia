
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { day: 'Mon', productive: 4, distractions: 2.4 },
  { day: 'Tue', productive: 3, distractions: 1.3 },
  { day: 'Wed', productive: 5, distractions: 2.5 },
  { day: 'Thu', productive: 6, distractions: 3.8 },
  { day: 'Fri', productive: 4, distractions: 2.1 },
  { day: 'Sat', productive: 3, distractions: 1.5 },
  { day: 'Sun', productive: 2, distractions: 1.1 },
];

export function ActivityChart() {
  return (
    <Card className="col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Weekly Activity</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 5,
                right: 10,
                left: 0,
                bottom: 5,
              }}
            >
              <defs>
                <linearGradient id="colorProductive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(221 83% 53%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(221 83% 53%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDistractions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0 84.2% 60.2%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(0 84.2% 60.2%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 5.9% 90%)" vertical={false} />
              <XAxis 
                dataKey="day" 
                tickLine={false}
                axisLine={false}
                style={{
                  fontSize: '12px',
                  fontFamily: 'Inter, sans-serif',
                  color: 'hsl(240 3.8% 46.1%)',
                }}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                style={{
                  fontSize: '12px',
                  fontFamily: 'Inter, sans-serif',
                  color: 'hsl(240 3.8% 46.1%)',
                }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid hsl(240 5.9% 90%)',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '12px',
                }}
              />
              <Area 
                type="monotone" 
                dataKey="productive" 
                stroke="hsl(221 83% 53%)" 
                fillOpacity={1} 
                fill="url(#colorProductive)" 
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="distractions" 
                stroke="hsl(0 84.2% 60.2%)" 
                fillOpacity={1} 
                fill="url(#colorDistractions)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center mt-3 gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <span className="text-sm text-muted-foreground">Productive Time</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive"></div>
            <span className="text-sm text-muted-foreground">Distractions</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
