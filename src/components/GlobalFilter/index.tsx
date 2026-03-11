import { DatePicker, Radio, Switch, Space, Select } from 'antd';
import type { FilterState, TimeGranularity } from '../../types';
import dayjs from 'dayjs';
import styles from './index.module.css';

const { RangePicker } = DatePicker;

const presets = [
  { label: '今日', value: [dayjs(), dayjs()] },
  { label: '昨日', value: [dayjs().subtract(1, 'day'), dayjs().subtract(1, 'day')] },
  { label: '近7天', value: [dayjs().subtract(6, 'day'), dayjs()] },
  { label: '近30天', value: [dayjs().subtract(29, 'day'), dayjs()] },
  { label: '本月', value: [dayjs().startOf('month'), dayjs()] },
  { label: '上月', value: [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')] },
];

interface GlobalFilterProps {
  filter: FilterState;
  onChange: (filter: FilterState) => void;
}

export default function GlobalFilter({ filter, onChange }: GlobalFilterProps) {
  return (
    <div className={styles.filterBar}>
      <Space size="middle" wrap>
        <Space size="small">
          <span className={styles.label}>时间范围</span>
          <RangePicker
            size="small"
            value={[dayjs(filter.dateRange[0]), dayjs(filter.dateRange[1])]}
            presets={presets.map(p => ({ label: p.label, value: p.value as [dayjs.Dayjs, dayjs.Dayjs] }))}
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                onChange({
                  ...filter,
                  dateRange: [dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD')],
                });
              }
            }}
          />
        </Space>
        <Space size="small">
          <span className={styles.label}>时间粒度</span>
          <Radio.Group
            size="small"
            value={filter.granularity}
            onChange={(e) => onChange({ ...filter, granularity: e.target.value as TimeGranularity })}
            optionType="button"
            buttonStyle="solid"
            options={[
              { label: '日', value: 'day' },
              { label: '周', value: 'week' },
              { label: '月', value: 'month' },
            ]}
          />
        </Space>
        <Space size="small">
          <span className={styles.label}>对比模式</span>
          <Switch
            size="small"
            checked={filter.compareMode}
            onChange={(checked) => onChange({ ...filter, compareMode: checked })}
          />
        </Space>
        <Space size="small">
          <span className={styles.label}>KTV类型</span>
          <Select
            size="small"
            value={filter.ktvType}
            onChange={(v) => onChange({ ...filter, ktvType: v })}
            style={{ width: 120 }}
            options={[
              { label: '全部', value: '全部' },
              { label: '量贩', value: '量贩' },
              { label: '雷客', value: '雷客' },
              { label: '夜总会', value: '夜总会' },
              { label: '酒吧', value: '酒吧' },
            ]}
          />
        </Space>
      </Space>
    </div>
  );
}
