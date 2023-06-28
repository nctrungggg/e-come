import React, { useContext, useEffect, useRef, useState } from 'react'
import type { InputRef } from 'antd'
import { Button, Form, Input, Popconfirm, Table } from 'antd'
import type { FormInstance } from 'antd/es/form'
import dayjs from 'dayjs'
import sizeService from '../../../service/admin-service/sizeService'

const EditableContext = React.createContext<FormInstance<any> | null>(null)

interface Item {
  key: string
  name: string
  createdAt: string
  updatedAt: string
}

interface EditableRowProps {
  index: number
}

const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm()
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  )
}

interface EditableCellProps {
  title: React.ReactNode
  editable: boolean
  children: React.ReactNode
  dataIndex: keyof Item
  record: Item
  handleSave: (record: Item) => void
}

const EditableCell: React.FC<EditableCellProps> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false)
  const inputRef = useRef<InputRef>(null)
  const form = useContext(EditableContext)!

  useEffect(() => {
    if (editing) {
      inputRef.current!.focus()
    }
  }, [editing])

  const toggleEdit = () => {
    setEditing(!editing)
    form.setFieldsValue({ [dataIndex]: record[dataIndex] })
  }

  const save = async () => {
    try {
      const values = await form.validateFields()

      toggleEdit()
      handleSave({ ...record, ...values })
    } catch (errInfo) {
      console.log('Save failed:', errInfo)
    }
  }

  let childNode = children

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} cannot be null.`,
          },
        ]}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div className="editable-cell-value-wrap" style={{ paddingRight: 24 }} onClick={toggleEdit}>
        {children}
      </div>
    )
  }

  return <td {...restProps}>{childNode}</td>
}

type EditableTableProps = Parameters<typeof Table>[0]

interface DataType {
  id: React.Key
  name: string
  createdAt: string
  updatedAt: string
}

type ColumnTypes = Exclude<EditableTableProps['columns'], undefined>

const SizePageContainer: React.FC = () => {
  const [dataSource, setDataSource] = useState<DataType[]>([])

  useEffect(() => {
    sizeService
      .getAllSize()
      .then((res) => setDataSource(res.data))
      .catch((error) => console.error(error))
  }, [])

  const handleDelete = async (id: string) => {
    const newData: DataType[] = dataSource.filter((data) => data.id !== id)
    if (newData) {
      setDataSource(newData)
    }

    await sizeService.deleteSize(id)
  }

  const defaultColumns: (ColumnTypes[number] & { editable?: boolean; dataIndex: string })[] = [
    {
      title: 'Size name',
      dataIndex: 'name',
      width: '30%',
      editable: true,
    },
    {
      title: 'Date created',
      dataIndex: 'createdAt',
      render: (_, record: any) => {
        return dayjs(record.createdAt).format('DD/MM/YYYY HH:mm:ss')
      },
    },
    {
      title: 'Date updated',
      dataIndex: 'updatedAt',
      render: (_, record: any) => {
        return dayjs(record.updatedAt).format('DD/MM/YYYY HH:mm:ss')
      },
    },
    {
      title: 'Action',
      dataIndex: 'key',
      render: (_, record: any) =>
        dataSource.length >= 1 ? (
          <Popconfirm
            okType="default"
            title="DO YOU WANT TO DELETE?"
            onConfirm={() => handleDelete(record.id)}
            className="hover:bg-[#777] hover:!text-[#fff] hover:!border-[#777]"
          >
            <Button type="default">Delete</Button>
          </Popconfirm>
        ) : null,
    },
  ]

  const handleAdd = async () => {
    const newData: DataType = {
      id: -1,
      name: `Size name`,
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    }
    setDataSource([...dataSource, newData])
  }

  const handleSave = async (row: DataType) => {
    const newData = [...dataSource]
    const index = newData.findIndex((item) => row.id === item.id)
    if (row.id === -1) {
      const res = await sizeService.createSize({ name: row.name })
      row.id = res.data.id
    } else {
      await sizeService.updateSize(+row.id, row.name)
    }
    newData[index] = row
    row.id = -2
    setDataSource(newData)
  }

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  }

  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col
    }
    return {
      ...col,
      onCell: (record: DataType) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    }
  })

  return (
    <div className="p-5">
      <div className="bg-[#FFFFFF] w-[100%] p-8">
        <button
          className="block ml-auto my-3 w-[120px] h-[40px] bg-white border  hover:bg-baseColor hover:text-[#FFFFFF] rounded-md transition-all"
          onClick={handleAdd}
          style={{ marginBottom: 16 }}
        >
          Create Size
        </button>
        <Table
          components={components}
          rowClassName={() => 'editable-row'}
          bordered
          dataSource={dataSource}
          columns={columns as ColumnTypes}
        />
      </div>
    </div>
  )
}

export default SizePageContainer
